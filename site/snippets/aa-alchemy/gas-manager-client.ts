import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"), // or any SmartAccountSigner
  gasManagerConfig: {
    policyId: "YourGasManagerPolicyId",
  },
});
