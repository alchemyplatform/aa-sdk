import { createLightAccountProvider } from "@alchemy/aa-accounts";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const provider = createLightAccountProvider({
  rpcProvider: `${sepolia.rpcUrls.alchemy.http[0]}/${"YOUR_API_KEY"}`,
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
