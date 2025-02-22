import dotenv from "dotenv";
dotenv.config();

import getPort from "get-port";
import { createServer } from "prool";
import { anvil, rundler } from "prool/instances";
import { createClient, http, type Chain, type ClientConfig } from "viem";
import { localhost } from "viem/chains";
import { split } from "../../aa-sdk/core/src/transport/split";
import { poolId, rundlerBinaryPath } from "./constants";
import { paymasterTransport } from "./paymaster/transport";

export const local060Instance = defineInstance({
  chain: localhost,
  forkBlockNumber: 6381303,
  forkUrl:
    process.env.VITEST_SEPOLIA_FORK_URL ??
    "https://ethereum-sepolia-rpc.publicnode.com",
  entryPointVersion: "0.6.0",
  anvilPort: 8545,
  bundlerPort: 8645,
});

export const local070Instance = defineInstance({
  chain: localhost,
  forkBlockNumber: 7303015,
  forkUrl:
    process.env.VITEST_SEPOLIA_FORK_URL ??
    "https://ethereum-sepolia-rpc.publicnode.com",
  entryPointVersion: "0.7.0",
  anvilPort: 8345,
  bundlerPort: 8445,
});

type DefineInstanceParams = {
  chain: Chain;
  forkUrl: string;
  forkBlockNumber?: number;
  entryPointVersion: "0.6.0" | "0.7.0";
  anvilPort: number;
  bundlerPort: number;
  useLocalRunningInstance?: boolean;
};

const bundlerMethods = [
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
  "eth_getUserOperationReceipt",
  "eth_getUserOperationByHash",
  "eth_supportedEntryPoints",
  "debug_bundler_sendBundleNow",
  "debug_bundler_dumpMempool",
  "debug_bundler_clearState",
  "debug_bundler_setBundlingMode",
];

function defineInstance(params: DefineInstanceParams) {
  const {
    anvilPort,
    bundlerPort,
    entryPointVersion,
    forkUrl,
    forkBlockNumber,
    chain: chain_,
    useLocalRunningInstance,
  } = params;
  const rpcUrls = () => ({
    bundler: `http://127.0.0.1:${bundlerPort}${
      useLocalRunningInstance ? "" : `/${poolId()}`
    }`,
    anvil: `http://127.0.0.1:${anvilPort}${
      useLocalRunningInstance ? "" : `/${poolId()}`
    }`,
  });

  const chain = {
    ...chain_,
    name: `${chain_.name} (Local)`,
    rpcUrls: {
      default: {
        http: [rpcUrls().anvil],
      },
    },
  } as const satisfies Chain;

  const clientConfig = {
    chain,
    transport(args) {
      const {
        config,
        request: request_,
        value,
      } = split({
        overrides: [
          {
            methods: bundlerMethods,
            transport: http(rpcUrls().bundler),
          },
          {
            methods: [
              "pm_getPaymasterStubData",
              "pm_getPaymasterData",
              "alchemy_requestGasAndPaymasterAndData",
              "rundler_maxPriorityFeePerGas",
            ],
            transport: paymasterTransport(
              createClient({
                chain,
                transport: http(rpcUrls().anvil),
              }).extend(() => ({ mode: "anvil" }))
            ),
          },
        ],
        fallback: http(rpcUrls().anvil),
      })(args);

      return {
        config,
        async request(params, opts) {
          return await request_(params, opts);
        },
        value,
      };
    },
  } as const satisfies ClientConfig;

  const anvilServer = createServer({
    instance: anvil({
      forkUrl: forkUrl,
      forkBlockNumber,
      chainId: chain.id,
    }),
    port: anvilPort,
  });

  const bundlerServer = createServer({
    instance: (key) =>
      rundler(
        {
          binary: rundlerBinaryPath,
          entryPointVersion,
          nodeHttp: `http://127.0.0.1:${anvilPort}/${key}`,
          rpc: {
            api: "eth,rundler,debug",
          },
        },
        { messageBuffer: 1000 }
      ),
    port: bundlerPort,
  });

  return {
    chain,
    clientConfig,
    anvilServer,
    bundlerServer,
    getClient() {
      return createClient({
        ...clientConfig,
        chain,
        transport: clientConfig.transport,
      }).extend(() => ({ mode: "anvil" }));
    },
    async restart() {
      if (useLocalRunningInstance) return;

      await fetch(`${rpcUrls().anvil}/restart`);
      await fetch(`${rpcUrls().bundler}/restart`);
    },
    async start() {
      if (useLocalRunningInstance) return async () => {};
      // We do this because it's possible we're running all workspaces at the same time
      // and we don't want to start the servers multiple times
      // This still gives us isolation because each workspace should have its own pool id
      if ((await getPort({ port: anvilPort })) === anvilPort) {
        await anvilServer.start();
      }
      if ((await getPort({ port: bundlerPort })) === bundlerPort) {
        await bundlerServer.start();
      }

      return async () => {
        await bundlerServer.stop();
        await anvilServer.stop();
      };
    },
    async stop() {
      if (useLocalRunningInstance) return;

      await anvilServer.stop();
      await bundlerServer.stop();
    },

    async getLogs(server: "anvil" | "bundler") {
      const port = server === "anvil" ? anvilPort : bundlerPort;
      const url = `http://127.0.0.1:${port}/${poolId()}/messages`;

      const response = await fetch(url);

      return await response.json();
    },
  };
}
