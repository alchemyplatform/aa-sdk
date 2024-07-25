import getPort from "get-port";
import { createServer } from "prool";
import { anvil, rundler } from "prool/instances";
import { createClient, http, type Chain, type ClientConfig } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { split } from "../../aa-sdk/core/src/transport/split";
import { poolId, rundlerBinaryPath } from "./constants";

export const anvilArbSepolia = defineInstance({
  chain: arbitrumSepolia,
  forkUrl: "https://arbitrum-sepolia-rpc.publicnode.com",
  anvilPort: 8545,
  bundlerPort: 8645,
});

type DefineInstanceParams = {
  chain: Chain;
  forkUrl: string;
  anvilPort: number;
  bundlerPort: number;
};

const bundlerMethods = [
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
  "eth_getUserOperationReceipt",
  "eth_getUserOperationByHash",
  "eth_supportedEntryPoints",
];

function defineInstance(params: DefineInstanceParams) {
  const { anvilPort, bundlerPort, forkUrl, chain: chain_ } = params;
  const rpcUrls = {
    bundler: `http://127.0.0.1:${bundlerPort}`,
    anvil: `http://127.0.0.1:${anvilPort}`,
  };

  const chain = {
    ...chain_,
    name: `${chain_.name} (Local)`,
    rpcUrls: {
      default: {
        http: [rpcUrls.anvil],
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
            transport: http(rpcUrls.bundler + `/${poolId}`),
          },
        ],
        fallback: http(rpcUrls.anvil + `/${poolId}`),
      })(args);

      return {
        config,
        request(params) {
          // Here we can add further custom handling for certain methods, or we can do it above in the split transport config
          return request_(params);
        },
        value,
      };
    },
  } as const satisfies ClientConfig;

  const anvilServer = createServer({
    instance: anvil({
      forkUrl: forkUrl,
      noMining: true,
    }),
    port: anvilPort,
  });

  const bundlerServer = createServer({
    instance: (key) =>
      rundler({
        binary: rundlerBinaryPath,
        nodeHttp: rpcUrls.anvil + `/${key}`,
      }),
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
      await fetch(`${rpcUrls.anvil}/${poolId}/restart`);
      await bundlerServer.stop();
      await bundlerServer.start();
    },
    async start() {
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
      await anvilServer.stop();
      await bundlerServer.stop();
    },
  };
}
