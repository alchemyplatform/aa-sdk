import { provider } from "../provider.js";

const providerWithSimulation = provider.withAlchemyUserOpSimulation();

const uo = await providerWithSimulation.sendUserOperation({
  target: "0xTARGET_ADDRESS",
  data: "0xDATA",
  value: 1n,
});

const txHash = await providerWithSimulation.waitForUserOperationTransaction(
  uo.hash
);

console.log(txHash);
