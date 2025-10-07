import { createConfig } from "wagmi";
import { arbitrumSepolia, sepolia } from "wagmi/chains";
import { alchemyAuth, alchemySmartWallet } from "@alchemy/connectors-web";
import { alchemyTransport, raise } from "@alchemy/common";

const apiKey =
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ??
  raise("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");

const policyId =
  process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID ??
  raise("NEXT_PUBLIC_PAYMASTER_POLICY_ID is not set");

export const config = createConfig({
  connectors: [
    alchemySmartWallet({
      ownerConnector: alchemyAuth({
        apiKey,
      }),
      apiKey,
      policyId,
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
  ssr: true,
});
