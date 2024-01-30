import { createLightAccountAlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const provider = createLightAccountAlchemyProvider({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
