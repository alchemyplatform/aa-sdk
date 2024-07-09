import { EthersProviderAdapter } from "@aa-sdk/ethers";
import { polygonMumbai } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { Alchemy, Network } from "alchemy-sdk";
import { http } from "viem";
import { signer } from "../aa-core/lightAccountClient";

// 1. Create alchemy instance
const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.MATIC_MUMBAI,
});
const ethersProvider = await alchemy.config.getProvider();

const chain = polygonMumbai;

// 2. smart account client from alchemy's ethers provider and connect with simple smart account
export const provider = EthersProviderAdapter.fromEthersProvider(
  ethersProvider,
  chain
).connectToAccount(
  await createLightAccount({
    chain,
    signer,
    transport: http(
      `${chain.rpcUrls.alchemy.http[0]}/${ethersProvider.apiKey}`
    ),
  })
);
