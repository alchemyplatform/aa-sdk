import { createLightAccountClient } from "@alchemy/aa-accounts";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
import { http } from "viem";

export const smartAccountClient = createLightAccountClient({
  transport: http("RPC_URL"),
  chain: sepolia,
  // or any other SmartAccountSigner
  signer: LocalAccountSigner.mnemonicToAccountSigner("YOUR_MNEMONIC"),
});
