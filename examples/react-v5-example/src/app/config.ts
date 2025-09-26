import { arbitrumSepolia, sepolia } from "wagmi/chains";
import { createAlchemyConfig } from "@alchemy/react";

export const config = createAlchemyConfig({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  chains: [arbitrumSepolia, sepolia],
});
