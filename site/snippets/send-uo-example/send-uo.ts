import { connectedProvider } from "./connect-account.js";

connectedProvider.withAlchemyGasManager({
  policyId: "POLICY_ID", // replace with your policy id, get yours at https://dashboard.alchemy.com/
});

const uo = await connectedProvider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xCallData",
});

const txHash = await connectedProvider.waitForUserOperationTransaction(uo.hash);

console.log(txHash);
