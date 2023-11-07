import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { sepolia } from "viem/chains";
import { createAlchemyEnhancedApiClient } from "./factory.js";

const provider = new AlchemyProvider({
  chain: sepolia,
  apiKey: "YOUR_API_KEY",
});

export const client = createAlchemyEnhancedApiClient({
  chain: sepolia,
  rpcUrl: `${sepolia.rpcUrls.alchemy.http[0]}/YOUR_API_KEY`,
});

const address = await provider.getAddress();

// get all tokens owned by the smart account
export const tokenBalances = await client.getTokenBalances(address, "erc20");
