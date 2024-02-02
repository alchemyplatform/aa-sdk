import {
  createLightAccount,
  lightAccountClientActions,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  createSmartAccountClient,
  polygonMumbai,
} from "@alchemy/aa-core";
import { http } from "viem";

const chain = polygonMumbai;
const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  "YOUR_OWNER_MNEMONIC"
);
const rpcTransport = http("https://polygon-mumbai.g.alchemy.com/v2/demo");

export const smartAccountClient = createSmartAccountClient({
  transport: rpcTransport,
  chain,
  account: await createLightAccount({
    transport: rpcTransport,
    chain,
    owner,
  }),
}).extend(lightAccountClientActions);
