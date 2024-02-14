import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

// Client with the Gas Manager to sponsor gas.
// Find your Gas Manager policy id at: dashboard.alchemy.com/gas-manager/policy/create
export const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"), // or any SmartAccountSigner
  gasManagerConfig: {
    policyId: "YourGasManagerPolicyId",
  },
});
