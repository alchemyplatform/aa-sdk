import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  network: Network.ETH_SEPOLIA,
  apiKey: "YOUR_API_KEY",
});

const provider = new AlchemyProvider({
  chain: sepolia,
  apiKey: "YOUR_API_KEY",
}).withAlchemyEnhancedApis(alchemy);

const address = await provider.getAddress();

// get all tokens owned by the smart account
export const tokenBalances = provider.core.getTokenBalances(address);
