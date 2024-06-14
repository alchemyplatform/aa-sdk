import { createLightAccount } from "@account-kit/smart-contracts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  polygonMumbai,
} from "@alchemy/aa-core";
import { http } from "viem";
import { provider } from "./ethers-provider.js";

const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(process.env.YOUR_OWNER_MNEMONIC!);

const chain = polygonMumbai;

// 2. Connect the provider to the smart account signer
export const accountSigner = provider.connectToAccount(
  await createLightAccount({
    chain,
    transport: http("RPC_URL"),
    signer: eoaSigner,
  })
);
