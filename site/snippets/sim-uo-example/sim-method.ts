import { createModularAccountAlchemyClient } from "@account-kit/infra";
import {
  LocalAccountSigner,
  UserOperationCallData,
  sepolia,
} from "@aa-sdk/core";

export const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_API_KEY",
  chain: sepolia,
  signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
});

const uoStruct: UserOperationCallData = {
  target: "0xTARGET_ADDRESS",
  data: "0xDATA",
  value: 1n,
};

const uoSimResult = await smartAccountClient.simulateUserOperation({
  uo: uoStruct,
});

if (uoSimResult.error) {
  console.error(uoSimResult.error.message);
}

const uo = await smartAccountClient.sendUserOperation({ uo: uoStruct });

const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);

console.log(txHash);
