import { createConfig } from "@account-kit/react";
import { sepolia } from "@aa-sdk/core";

export const config = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: sepolia,
});
