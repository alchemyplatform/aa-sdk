import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, SmartAccountSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(YOUR_OWNER_MNEMONIC);

export const provider = new AlchemyProvider({
  entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  chain: polygonMumbai,
  apiKey: "demo",
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
