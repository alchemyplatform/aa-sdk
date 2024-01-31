import { createLightAccountClient } from "@alchemy/aa-accounts";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
import { http } from "viem";

export const provider = createLightAccountClient({
  transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/${"YOUR_API_KEY"}`),
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
