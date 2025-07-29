import { getBlock } from "viem/actions";
import { fromHex, type Hex, type Client } from "viem";
import type { UserOperationRequest } from "viem/account-abstraction";

// Minimal RPC schema that only declares the Alchemy priority fee method.
type AlchemyRpcSchema = [
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: UserOperationRequest["maxPriorityFeePerGas"];
  },
];

/**
 * Custom `estimateFeesPerGas` implementation that leverages Alchemy's
 * `rundler_maxPriorityFeePerGas` endpoint for priority fee estimation and
 * applies a 1.5× multiplier to the base fee ─ mirroring the logic used in
 * the Alchemy AA SDK.
 *
 * Pass this function to viem's `createBundlerClient` via
 * `userOperation.estimateFeesPerGas`.
 *
 * @param {object} params - Parameters object.
 * @param {Client<any, any, undefined, AlchemyRpcSchema>} params.bundlerClient - A viem Bundler Client that supports the `rundler_maxPriorityFeePerGas` RPC method.
 * @param {unknown} [params.account] - Smart account (unused in this estimator).
 * @param {UserOperationRequest} [params.userOperation] - Draft UserOperation (unused in this estimator).
 * @returns {Promise<{maxFeePerGas: bigint, maxPriorityFeePerGas: bigint}>} Estimated `maxFeePerGas` & `maxPriorityFeePerGas` values.
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyEstimateFeesPerGas } from "@your-lib/alchemyEstimateFeesPerGas";
 *
 * const bundlerClient = createBundlerClient({
 *   transport: http("<alchemy-rundler-url>"),
 *   userOperation: {
 *     estimateFeesPerGas: alchemyEstimateFeesPerGas,
 *   },
 * });
 * ```
 */
export async function alchemyEstimateFeesPerGas({
  bundlerClient,
}: {
  bundlerClient: Client<any, any, undefined, AlchemyRpcSchema>;
  account?: unknown;
  userOperation?: UserOperationRequest;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  // Retrieve the latest block (for base fee) and the custom priority fee.
  const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
    getBlock(bundlerClient, { blockTag: "latest" }),
    bundlerClient.request({
      method: "rundler_maxPriorityFeePerGas",
      params: [],
    }),
  ]);

  const baseFeePerGas = block.baseFeePerGas;
  if (baseFeePerGas == null) {
    throw new Error("baseFeePerGas is null");
  }

  // `rundler_maxPriorityFeePerGas` returns a hex string per viem convention.
  if (maxPriorityFeePerGasEstimate == null) {
    throw new Error("rundler_maxPriorityFeePerGas returned null or undefined");
  }

  const maxPriorityFeePerGas =
    typeof maxPriorityFeePerGasEstimate === "bigint"
      ? maxPriorityFeePerGasEstimate
      : fromHex(maxPriorityFeePerGasEstimate as Hex, "bigint");

  // Apply a 1.5× multiplier to the base fee (same as Alchemy's AA SDK) and add the priority fee.
  const maxFeePerGas = (baseFeePerGas * 150n) / 100n + maxPriorityFeePerGas;

  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
}
