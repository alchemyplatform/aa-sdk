import { createMultiOwnerLightAccountAlchemyClient } from "@account-kit/infra";
import { LocalAccountSigner, sepolia } from "@aa-sdk/core";

export const lightAccountClient =
  await createMultiOwnerLightAccountAlchemyClient({
    apiKey: "YOUR_API_KEY",
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
    // Additional initial owners can be listed here.
    owners: [],
  });
