import type { BigNumberish } from "../../types";
import { applyUserOpOverrideOrFeeOption } from "../../utils/index.js";
import type { MiddlewareClient } from "../actions";
import type { ClientMiddlewareFn } from "../types";

/**
 * Default fee estimator middleware function that estimates the maximum fee per gas and maximum priority fee per gas for a given client and applies the necessary overrides and fee options.
 *
 * @example
 * ```ts
 * import { createSmartAccountClient, defaultFeeEstimator, createBundlerClient } from "@aa-sdk/core";
 *
 * const bundlerClient = createBundlerClient(...);
 *
 * // NOTE: this is already provided by the smart account client
 * const client = createSmartAccountClient({
 *  feeEstimator: defaultFeeEstimator(bundlerClient),
 *  ...otherParams
 * });
 * ```
 *
 * @template {MiddlewareClient} C The type of the client
 * @param {C} client The client to perform the fee estimation
 * @returns {ClientMiddlewareFn} A middleware function that takes in the struct and options, estimates the fees, and updates the struct with the estimated fees
 */
export function defaultFeeEstimator<C extends MiddlewareClient>(
  client: C,
): ClientMiddlewareFn {
  return async (struct, { overrides, feeOptions }) => {
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
        "feeData is missing maxFeePerGas or maxPriorityFeePerGas",
      );
    }

    let maxPriorityFeePerGas: BigNumberish =
      await client.estimateMaxPriorityFeePerGas();

    maxPriorityFeePerGas = applyUserOpOverrideOrFeeOption(
      maxPriorityFeePerGas,
      overrides?.maxPriorityFeePerGas,
      feeOptions?.maxPriorityFeePerGas,
    );

    let maxFeePerGas: BigNumberish =
      feeData.maxFeePerGas -
      feeData.maxPriorityFeePerGas +
      BigInt(maxPriorityFeePerGas);

    maxFeePerGas = applyUserOpOverrideOrFeeOption(
      maxFeePerGas,
      overrides?.maxFeePerGas,
      feeOptions?.maxFeePerGas,
    );

    struct.maxFeePerGas = maxFeePerGas;
    struct.maxPriorityFeePerGas = maxPriorityFeePerGas;
    return struct;
  };
}
