import { createMultiOwnerLightAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const lightAccountClient =
  await createMultiOwnerLightAccountAlchemyClient({
    apiKey: "YOUR_API_KEY",
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
    // Additional initial owners can be listed here.
    owners: [],
  });
