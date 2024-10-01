import { createConfig } from "@account-kit/core";
import { alchemy, sepolia } from "@account-kit/infra";

export const config = createConfig({
  transport: alchemy({ apiKey: "YOUR_API_KEY" }),
  chain: sepolia,
  // optional if you want to sponsor gas
  policyId: "YOUR_POLICY_ID",
});
