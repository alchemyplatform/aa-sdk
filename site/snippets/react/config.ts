import { createConfig } from "@account-kit/react";
import { sepolia } from "@alchemy/aa-core";

export const config = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: sepolia,
});
