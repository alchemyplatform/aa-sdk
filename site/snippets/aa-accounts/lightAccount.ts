import { createLightAccount } from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  polygonMumbai,
} from "@alchemy/aa-core";
import { http } from "viem";

export const chain = polygonMumbai;
export const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner("YOUR_OWNER_MNEMONIC");
export const rpcTransport = http(
  "https://polygon-mumbai.g.alchemy.com/v2/demo"
);

export const smartAccount = await createLightAccount({
  transport: rpcTransport,
  chain,
  owner,
});
