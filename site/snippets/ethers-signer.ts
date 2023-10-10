import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { LocalAccountSigner, SmartAccountSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
import { entryPointAddress, provider } from "./ethers-provider.js";

const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);

export const signer = provider.connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: entryPointAddress,
      chain: polygonMumbai,
      factoryAddress: getDefaultLightAccountFactory(polygonMumbai),
      rpcClient,
      owner,
    })
);
