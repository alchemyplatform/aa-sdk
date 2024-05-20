import { createConfig } from "@alchemy/aa-alchemy/config";
import { base, mainnet, sepolia } from "@alchemy/aa-core";

// the examples use different routes for your chains and signer connection, but you can handle
// this in one route if you prefer
export const config = createConfig({
  // this is the default chain to connect to
  chain: sepolia,
  // this adds configs for all other chains you want to support.
  // NOTE: you must include a config for the default chain as well
  connections: [
    // connection using rpcUrl
    { chain: sepolia, rpcUrl: "/api/rpc/sepolia" },
    // connection using an api key
    { chain: mainnet, apiKey: "ALCHEMY_API_KEY" },
    // connection using a gas manager
    {
      chain: base,
      apiKey: "ALCHEMY_API_KEY",
      gasManagerConfig: { policyId: "POLICY_ID" },
    },
  ],
  // when using multiple chains, you must specify the signer connection config since it might be different than your chain RPC urls
  signerConnection: {
    rpcUrl: "/api/rpc/signer",
  },
});
