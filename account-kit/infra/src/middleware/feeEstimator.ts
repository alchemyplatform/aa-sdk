import type { ClientMiddlewareFn } from "@alchemy/aa-core";
import { applyUserOpOverrideOrFeeOption } from "@alchemy/aa-core";
import type { ClientWithAlchemyMethods } from "../client/types";

/**
 * Function that estimates the transaction fees using Alchemy methods for a given client.
 * It fetches the latest block and estimates the max priority fee per gas, applying any overrides or fee options provided.
 *
 * @example
 * ```ts
 * import { alchemyFeeEstimator, createAlchemyPublicRpcClient } from "@account-kit/infra";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const bundlerClient = createAlchemyPublicRpcClient(...);
 * const client = createSmartAccountClient({
 *  feeEstimator: alchemyFeeEstimator(bundlerClient),
 *  ...otherParams
 * });
 * ```
 *
 * @param {ClientWithAlchemyMethods} client The client with Alchemy methods
 * @returns {ClientMiddlewareFn} A middleware function that takes a transaction structure and fee options, and returns the augmented structure with estimated fees
 */
export const alchemyFeeEstimator: <C extends ClientWithAlchemyMethods>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { overrides, feeOptions }) => {
    let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
      client.getBlock({ blockTag: "latest" }),
      // it is a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      client.request({
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      }),
    ]);

    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }

    const maxPriorityFeePerGas = applyUserOpOverrideOrFeeOption(
      maxPriorityFeePerGasEstimate,
      overrides?.maxPriorityFeePerGas,
      feeOptions?.maxPriorityFeePerGas
    );
    const maxFeePerGas = applyUserOpOverrideOrFeeOption(
      baseFeePerGas + BigInt(maxPriorityFeePerGas),
      overrides?.maxFeePerGas,
      feeOptions?.maxFeePerGas
    );

    return {
      ...struct,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  };
