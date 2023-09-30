import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { LocalAccountSigner, SmartAccountSigner } from "@alchemy/aa-core";
import { EthersProviderAdapter } from "@alchemy/aa-ethers";
import { Alchemy, Network } from "alchemy-sdk";
import { polygonMumbai } from "viem/chains";

const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);

const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.MATIC_MUMBAI,
});
const alchemyProvider = await alchemy.config.getProvider();

export const provider = EthersProviderAdapter.fromEthersProvider(
  alchemyProvider,
  entryPointAddress
).connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: entryPointAddress,
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
