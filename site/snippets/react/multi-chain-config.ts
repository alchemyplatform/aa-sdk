import { createConfig } from "@alchemy/aa-alchemy/config";
import { sepolia } from "@alchemy/aa-core";
import { mainnet } from "viem/chains";

// the examples use different routes for your chains and signer connection, but you can handle
// this in one route if you prefer
export const config = createConfig({
  // this is the default chain to connect to
  chain: sepolia,
  // this adds configs for all other chains you want to support.
  // NOTE: you must include a config for the default chain as well
  connections: [
    { chain: sepolia, rpcUrl: "/api/rpc/sepolia" },
    { chain: mainnet, rpcUrl: "/api/rpc/mainnet" },
  ],
  // when using multiple chains, you must specify the signer connection config since it might be different than your chain RPC urls
  signerConnection: {
    rpcUrl: "/api/rpc/signer",
  },
});
