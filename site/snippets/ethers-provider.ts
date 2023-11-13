import { EthersProviderAdapter } from "@alchemy/aa-ethers";
import { Alchemy, Network } from "alchemy-sdk";

// 1. Create a provider using EthersProviderAdapter
const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.MATIC_MUMBAI,
});
const ethersProvider = await alchemy.config.getProvider();

export const provider =
  EthersProviderAdapter.fromEthersProvider(ethersProvider);
