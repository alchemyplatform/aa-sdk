import { createModularAccountAlchemyClient } from "@account-kit/infra";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
  useSimulation: true,
});

const uo = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTARGET_ADDRESS",
    data: "0xDATA",
    value: 1n,
  },
});

const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);

console.log(txHash);
