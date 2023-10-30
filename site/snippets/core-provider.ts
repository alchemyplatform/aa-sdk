import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountProvider,
  SmartAccountSigner,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const chain = polygonMumbai;
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(YOUR_OWNER_MNEMONIC);
const entryPointAddress = getDefaultEntryPointAddress(chain);
const factoryAddress = getDefaultLightAccountFactoryAddress(chain);

export const provider = new SmartAccountProvider({
  rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress,
      chain,
      factoryAddress,
      rpcClient,
      owner,
    })
);
