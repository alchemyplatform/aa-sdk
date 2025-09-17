import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { alchemyAuth } from "@alchemy/connectors-web";

export const config = createConfig({
  connectors: [
    alchemyAuth({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
  ],
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});
