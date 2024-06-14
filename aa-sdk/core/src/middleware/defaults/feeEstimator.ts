import type { BigNumberish } from "../../types";
import { applyUserOpOverrideOrFeeOption } from "../../utils/index.js";
import type { MiddlewareClient } from "../actions";
import type { ClientMiddlewareFn } from "../types";

export const defaultFeeEstimator: <C extends MiddlewareClient>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { overrides, feeOptions }) => {
    // maxFeePerGas must be at least the sum of maxPriorityFeePerGas and baseFee
    // so we need to accommodate for the fee option applied maxPriorityFeePerGas for the maxFeePerGas
    //
    // Note that if maxFeePerGas is not at least the sum of maxPriorityFeePerGas and required baseFee
    // after applying the fee options, then the transaction will fail
    //
    // Refer to https://docs.alchemy.com/docs/maxpriorityfeepergas-vs-maxfeepergas
    // for more information about maxFeePerGas and maxPriorityFeePerGas

    const feeData = await client.estimateFeesPerGas();
    if (!feeData.maxFeePerGas || feeData.maxPriorityFeePerGas == null) {
      throw new Error(
        "feeData is missing maxFeePerGas or maxPriorityFeePerGas"
      );
    }

    let maxPriorityFeePerGas: BigNumberish =
      await client.estimateMaxPriorityFeePerGas();

    maxPriorityFeePerGas = applyUserOpOverrideOrFeeOption(
      maxPriorityFeePerGas,
      overrides?.maxPriorityFeePerGas,
      feeOptions?.maxPriorityFeePerGas
    );

    let maxFeePerGas: BigNumberish =
      feeData.maxFeePerGas -
      feeData.maxPriorityFeePerGas +
      BigInt(maxPriorityFeePerGas);

    maxFeePerGas = applyUserOpOverrideOrFeeOption(
      maxFeePerGas,
      overrides?.maxFeePerGas,
      feeOptions?.maxFeePerGas
    );

    struct.maxFeePerGas = maxFeePerGas;
    struct.maxPriorityFeePerGas = maxPriorityFeePerGas;
    return struct;
  };
