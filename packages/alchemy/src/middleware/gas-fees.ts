import { applyFeeOption, applyUserOperationOverride } from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyGasFeeEstimator = (
  provider: AlchemyProvider
): AlchemyProvider => {
  provider.withFeeDataGetter(async (struct, overrides, feeOptions) => {
    let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
      provider.rpcClient.getBlock({ blockTag: "latest" }),
      // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      (provider.rpcClient as ClientWithAlchemyMethods).request({
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      }),
    ]);
    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }

    const maxPriorityFeePerGas =
      applyUserOperationOverride(
        maxPriorityFeePerGasEstimate,
        overrides?.maxPriorityFeePerGas
      ) ||
      applyFeeOption(
        maxPriorityFeePerGasEstimate,
        feeOptions?.maxPriorityFeePerGas
      );
    const maxFeePerGas =
      applyUserOperationOverride(
        baseFeePerGas + BigInt(maxPriorityFeePerGas),
        overrides?.maxPriorityFeePerGas
      ) ||
      applyFeeOption(
        baseFeePerGas + BigInt(maxPriorityFeePerGas),
        feeOptions?.maxPriorityFeePerGas
      );

    return {
      ...struct,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  });
  return provider;
};
