import type { ClientMiddlewareFn } from "@aa-sdk/core";
import {
  applyUserOpOverrideOrFeeOption,
  bigIntMultiply,
  clientHeaderTrack,
} from "@aa-sdk/core";
import type { AlchemyTransport } from "../alchemyTransport";

/**
 * Function that estimates the transaction fees using Alchemy methods for a given client.
 * It fetches the latest block and estimates the max priority fee per gas, applying any overrides or fee options provided.
 *
 * @example
 * ```ts
 * import { alchemyFeeEstimator, alchemy } from "@account-kit/infra";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const alchemyTransport = alchemy({
 *  chain: sepolia,
 *  apiKey: "your-api-key"
 * });
 *
 * const client = createSmartAccountClient({
 *  feeEstimator: alchemyFeeEstimator(alchemyTransport),
 *  ...otherParams
 * });
 * ```
 *
 * @param {AlchemyTransport} transport An alchemy transport for making Alchemy specific RPC calls
 * @returns {ClientMiddlewareFn} A middleware function that takes a transaction structure and fee options, and returns the augmented structure with estimated fees
 */
export const alchemyFeeEstimator: (
  transport: AlchemyTransport,
) => ClientMiddlewareFn =
  (transport) =>
  async (struct, { overrides, feeOptions, client: client_ }) => {
    const client = clientHeaderTrack(client_, "alchemyFeeEstimator");
    const transport_ = transport({ chain: client.chain });
    let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
      client.getBlock({ blockTag: "latest" }),
      // it is a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      transport_.request({
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
      feeOptions?.maxPriorityFeePerGas,
    );
    const maxFeePerGas = applyUserOpOverrideOrFeeOption(
      bigIntMultiply(baseFeePerGas, 1.5) + BigInt(maxPriorityFeePerGas),
      overrides?.maxFeePerGas,
      feeOptions?.maxFeePerGas,
    );

    return {
      ...struct,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  };
