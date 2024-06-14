import {
  createLightAccount,
  lightAccountClientActions,
} from "@account-kit/smart-contracts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  createSmartAccountClient,
  polygonMumbai,
} from "@aa-sdk/core";
import { http } from "viem";

export const chain = polygonMumbai;
export const signer: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner("YOUR_OWNER_MNEMONIC");
export const rpcTransport = http(
  "https://polygon-mumbai.g.alchemy.com/v2/demo"
);

export const smartAccountClient = createSmartAccountClient({
  transport: rpcTransport,
  chain,
  account: await createLightAccount({
    transport: rpcTransport,
    chain,
    signer,
  }),
}).extend(lightAccountClientActions);
