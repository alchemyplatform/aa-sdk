import { createModularAccountAlchemyClient } from "@account-kit/core";
import { sessionKeyPluginActions } from "@alchemy/aa-accounts";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const client = (
  await createModularAccountAlchemyClient({
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("MNEMONIC"),
    apiKey: "ALCHEMY_API_KEY",
  })
).extend(sessionKeyPluginActions);
