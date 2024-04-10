import { createConfig } from "@alchemy/aa-alchemy/config";
import { sepolia } from "@alchemy/aa-core";

export const config = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: sepolia,
});
