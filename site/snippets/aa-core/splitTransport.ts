import { createSmartAccountClient, sepolia, split } from "@alchemy/aa-core";
import { http } from "viem";

const bundlerMethods = [
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
  "eth_getUserOperationReceipt",
  "eth_getUserOperationByHash",
  "eth_supportedEntryPoints",
];

const splitTransport = split({
  overrides: [
    {
      methods: bundlerMethods,
      transport: http("BUNDLER_RPC_URL"),
    },
  ],
  fallback: http("OTHER_RPC_URL"),
});

export const client = createSmartAccountClient({
  chain: sepolia,
  transport: splitTransport,
});
