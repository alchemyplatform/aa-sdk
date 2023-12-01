import { createLightAccountAlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

export const provider = createLightAccountAlchemyProvider({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
