import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Alchemy, Network } from "alchemy-sdk";
import { sepolia } from "viem/chains";

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
