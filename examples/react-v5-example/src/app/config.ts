import { createConfig } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { alchemyAuth } from "@alchemy/connectors-web";
import { alchemyTransport } from "@alchemy/common";

export const config = createConfig({
  connectors: [
    alchemyAuth({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
  ],
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: alchemyTransport({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
  },
});
