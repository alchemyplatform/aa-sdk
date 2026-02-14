import dotenv from "dotenv";
dotenv.config();

import getPort from "get-port";
import { createServer } from "prool";
import { anvil, type AnvilParameters } from "prool/instances";
import {
  createClient,
  http,
  type Chain,
  type ClientConfig,
  custom,
  type CustomTransport,
  type Transport,
} from "viem";
import { localhost } from "viem/chains";
import { poolId, rundlerBinaryPath } from "./constants";
import { paymasterTransport } from "./paymaster/transport";
import { rundler } from "./rundler/instance";

export const localInstance = defineInstance({
  chain: localhost,
  forkBlockNumber: 23456789, // must be after Pectra for EIP-7623
  forkUrl:
    process.env.VITEST_SEPOLIA_FORK_URL ??
    "https://ethereum-sepolia-rpc.publicnode.com",
  anvilPort: 18545,
  bundlerPort: 18546,
});

type DefineInstanceParams = {
  chain: Chain;
  forkUrl: string;
  forkBlockNumber?: number;
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
  "rundler_maxPriorityFeePerGas",
];

const split = (params: {
  overrides: {
    methods: string[];
    transport: Transport;
  }[];
  fallback: Transport;
}): CustomTransport => {
  const overrideMap = params.overrides.reduce((accum, curr) => {
    curr.methods.forEach((method) => {
      if (accum.has(method) && accum.get(method) !== curr.transport) {
        throw new Error(
          "A method cannot be handled by more than one transport",
        );
      }

      accum.set(method, curr.transport);
    });

    return accum;
  }, new Map<string, Transport>());

  return (opts) =>
    custom({
      request: async (args) => {
        const transportOverride = overrideMap.get(args.method);
        if (transportOverride != null) {
          return transportOverride(opts).request(args);
        }

        return params.fallback(opts).request(args);
      },
    })(opts);
};

function defineInstance(params: DefineInstanceParams) {
  const {
    anvilPort,
    bundlerPort,
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
            ],
            transport: paymasterTransport(
              createClient({
                chain,
                transport: http(rpcUrls().anvil),
              }).extend(() => ({ mode: "anvil" })),
              // Paymaster transport needs to be able to send requests
              // to the bundler in order to estimate gas during the
              // alchemy_requestGasAndPaymasterAndData method.
              createClient({
                chain,
                transport: http(rpcUrls().bundler),
              }).extend(() => ({ mode: "bundler" })),
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
      // "Prague" isn't an available option here since Anvil
      // hasn't been updated for a while, but it works fine.
      hardfork: "Prague" as AnvilParameters["hardfork"],
    }),
    port: anvilPort,
  });

  const bundlerServer = createServer({
    instance: (key) =>
      rundler(
        {
          binary: rundlerBinaryPath,
          nodeHttp: `http://127.0.0.1:${anvilPort}/${key}`,
          rpc: {
            api: "eth,rundler,debug",
          },
        },
        { messageBuffer: 10 },
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
