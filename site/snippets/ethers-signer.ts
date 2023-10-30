import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
import { provider } from "./ethers-provider.js";

const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);

const chain = polygonMumbai;
const entryPointAddress = getDefaultEntryPointAddress(chain);
const factoryAddress = getDefaultLightAccountFactoryAddress(chain);

export const signer = provider.connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress,
      chain,
      factoryAddress,
      rpcClient,
      owner,
    })
);
