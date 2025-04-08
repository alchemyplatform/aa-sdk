import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import {
  createModularAccountAlchemyClient,
  sessionKeyPluginActions,
} from "@account-kit/smart-contracts";

export const client = (
  await createModularAccountAlchemyClient({
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("MNEMONIC"),
    transport: alchemy({ apiKey: "ALCHEMY_API_KEY" }),
  })
).extend(sessionKeyPluginActions);
