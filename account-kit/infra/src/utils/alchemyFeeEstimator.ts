import { getBlock } from "viem/actions";
import { fromHex, isHex, type Client } from "viem";
import { BaseError, bigIntMultiply } from "@alchemy/common";

/**
 * Error thrown when an invalid hex value is encountered during fee estimation.
 */
export class InvalidHexValueError extends BaseError {
  override name = "InvalidHexValueError";

  constructor(value: unknown) {
    super(`Invalid hex value: ${value}`);
  }
}

/**
 * Simple Alchemy fee estimation that uses rundler_maxPriorityFeePerGas
 *
 * @param {object} params - The parameters
 * @param {Client} params.bundlerClient - The bundler client to use for RPC calls
 * @returns {{maxFeePerGas: bigint, maxPriorityFeePerGas: bigint}} The estimated fees
 */
export async function alchemyEstimateFeesPerGas(params: {
  bundlerClient: Client;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
    getBlock(params.bundlerClient, { blockTag: "latest" }),
    (params.bundlerClient as any).request({
      method: "rundler_maxPriorityFeePerGas",
      params: [],
    }),
  ]);

  const baseFeePerGas = block.baseFeePerGas;
  if (baseFeePerGas == null) throw new Error("baseFeePerGas is null");
  if (maxPriorityFeePerGasEstimate == null)
    throw new Error("rundler_maxPriorityFeePerGas returned null or undefined");

  // With RpcUserOperation typing, this should always be a hex string
  const maxPriorityFeePerGas = isHex(maxPriorityFeePerGasEstimate)
    ? fromHex(maxPriorityFeePerGasEstimate, "bigint")
    : (() => {
        throw new InvalidHexValueError(maxPriorityFeePerGasEstimate);
      })();

  return {
    maxPriorityFeePerGas,
    maxFeePerGas: bigIntMultiply(baseFeePerGas, 1.5) + maxPriorityFeePerGas,
  };
}
