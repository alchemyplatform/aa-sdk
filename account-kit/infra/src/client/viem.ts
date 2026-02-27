import { createBundlerClient } from "viem/account-abstraction";
import type { AlchemySmartAccountClientConfig } from "./smartAccountClient";

// Yea this isn't great or going to work well, we should just keep using our smart account client, but change the account type to match the viem one
export const foo = (params: AlchemySmartAccountClientConfig) => {
  const cl = createBundlerClient({
    transport: params.transport,
    chain: params.chain,
    paymasterContext: { policyId: params.policyId },
    paymaster: {
      async getPaymasterStubData(parameters) {
        if (!("policyId" in parameters.context)) {
          throw new Error("policyId is required");
        }

        throw new Error(
          "this is the biggest issue with viem's approach. we can't skip gas estimation during paymaster flows..."
        );
      },
      async getPaymasterData(parameters) {
        throw new Error("port over the paymaster data middleware");
      },
    },
    userOperation: {
      // This doesn't have the ability to skip gas estimation AFAICT
      estimateFeesPerGas(parameters) {
        throw new Error("port over the fee estimator middleware");
      },
    },
  });

  return cl;
};
