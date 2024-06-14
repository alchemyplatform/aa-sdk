import { createModularAccountAlchemyClient } from "@account-kit/infra";
import { sessionKeyPluginActions } from "@account-kit/smart-contracts";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const client = (
  await createModularAccountAlchemyClient({
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("MNEMONIC"),
    apiKey: "ALCHEMY_API_KEY",
  })
).extend(sessionKeyPluginActions);
