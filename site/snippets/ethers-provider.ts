import { EthersProviderAdapter } from "@alchemy/aa-ethers";
import { Alchemy, Network } from "alchemy-sdk";

export const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.MATIC_MUMBAI,
});
const ethersProvider = await alchemy.config.getProvider();

export const provider = EthersProviderAdapter.fromEthersProvider(
  ethersProvider,
  entryPointAddress
);
