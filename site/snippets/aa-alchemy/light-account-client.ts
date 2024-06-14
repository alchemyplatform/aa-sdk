import { createLightAccountAlchemyClient } from "@account-kit/infra";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const smartAccountClient = await createLightAccountAlchemyClient({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
