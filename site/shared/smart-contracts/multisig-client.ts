import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import { createMultisigAccountAlchemyClient } from "@account-kit/smart-contracts";

const MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC = "YOUR MNEMONIC";

// Creating a 3/3 multisig account
export const signers = [
  LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 0 }
  ),
  LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 1 }
  ),
  LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 2 }
  ),
];

export const threshold = 3n;

export const owners = await Promise.all(signers.map((s) => s.getAddress()));

export const multisigAccountClient = await createMultisigAccountAlchemyClient({
  chain: sepolia,
  signer: signers[0],
  owners,
  threshold,
  transport: alchemy({
    apiKey: "YOUR_API_KEY",
  }),
});
