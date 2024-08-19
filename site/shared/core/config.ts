import { createConfig } from "@account-kit/core";
import { sepolia } from "@account-kit/infra";

export const config = createConfig({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  // optional if you want to sponsor gas
  policyId: "YOUR_POLICY_ID",
});
