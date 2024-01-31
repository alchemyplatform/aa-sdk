import { createLightAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";

export const smartAccountClient = await createLightAccountAlchemyClient({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
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
