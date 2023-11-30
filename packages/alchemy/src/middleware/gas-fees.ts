import { applyFeeOption, type BigNumberish } from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyGasFeeEstimator = (
  provider: AlchemyProvider
): AlchemyProvider => {
  provider.withFeeDataGetter(async (struct, overrides, feeOptions) => {
    const maxPriorityFeePerGas =
      overrides?.maxPriorityFeePerGas != null
        ? overrides?.maxPriorityFeePerGas
        : // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
          applyFeeOption(
            await (provider.rpcClient as ClientWithAlchemyMethods).request({
              method: "rundler_maxPriorityFeePerGas",
              params: [],
            }),
            feeOptions?.maxPriorityFeePerGas
          );

    const estimateMaxFeePerGas = async (priorityFeePerGas: BigNumberish) => {
      const block = await provider.rpcClient.getBlock({ blockTag: "latest" });
      const baseFeePerGas = block.baseFeePerGas;
      if (baseFeePerGas == null) {
        throw new Error("baseFeePerGas is null");
      }
      return applyFeeOption(
        baseFeePerGas + BigInt(priorityFeePerGas),
        feeOptions?.maxFeePerGas
      );
    };

    const maxFeePerGas =
      overrides?.maxFeePerGas != null
        ? overrides?.maxFeePerGas
        : await estimateMaxFeePerGas(maxPriorityFeePerGas);

    return {
      ...struct,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  });
  return provider;
};
