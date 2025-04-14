import { createConfig } from "@account-kit/core";
import { alchemy, sepolia } from "@account-kit/infra";

export const config = createConfig({
  transport: alchemy({ apiKey: "YOUR_API_KEY" }),
  chain: sepolia,
  ssr: true,
});
