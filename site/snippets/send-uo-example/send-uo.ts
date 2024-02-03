import { smartAccountClient } from "../connected-client.js";
import { uoCallData } from "./calldata.js";

const uo = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTARGET_ADDRESS",
    data: uoCallData,
  },
});

const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);

console.log(txHash);
