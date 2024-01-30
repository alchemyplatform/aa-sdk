import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  polygonMumbai,
} from "@alchemy/aa-core";
import { provider } from "./ethers-provider.js";

const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);

const chain = polygonMumbai;

// 2. Connect the provider to the smart account signer
export const signer = provider.connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
      owner,
    })
);
