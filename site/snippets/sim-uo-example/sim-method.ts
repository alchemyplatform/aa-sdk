import { UserOperationCallData } from "@alchemy/aa-core";
import { provider } from "../provider.js";

const uoStruct: UserOperationCallData = {
  target: "0xTARGET_ADDRESS",
  data: "0xDATA",
  value: 1n,
};

const uoSimResult = await provider.simulateUserOperationAssetChanges(uoStruct);

if (uoSimResult.error) {
  console.error(uoSimResult.error.message);
}

const uo = await provider.sendUserOperation(uoStruct);

const txHash = await provider.waitForUserOperationTransaction(uo.hash);

console.log(txHash);
