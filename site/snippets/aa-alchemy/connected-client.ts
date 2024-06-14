import { createModularAccountAlchemyClient } from "@account-kit/infra";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const chain = sepolia;

export const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_API_KEY",
  chain,
  // you can swap this out for any SmartAccountSigner
  signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});
