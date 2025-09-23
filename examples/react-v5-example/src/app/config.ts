import { createConfig } from "wagmi";
import { arbitrumSepolia, sepolia } from "wagmi/chains";
import { alchemyAuth } from "@alchemy/connectors-web";
import { alchemyTransport } from "@alchemy/common";

export const config = createConfig({
  connectors: [
    alchemyAuth({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
  ],
  chains: [arbitrumSepolia, sepolia],
  transports: {
    [arbitrumSepolia.id]: alchemyTransport({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    [sepolia.id]: alchemyTransport({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
  },
});
