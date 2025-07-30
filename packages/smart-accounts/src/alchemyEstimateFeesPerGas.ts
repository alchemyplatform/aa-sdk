import { getBlock } from "viem/actions";
import { fromHex, type Hex, type Client, rpcSchema } from "viem";
import type {
  UserOperationRequest,
  SmartAccount,
} from "viem/account-abstraction";

// Minimal RPC schema that only declares the Alchemy priority fee method.
export type AlchemyRpcSchema = [
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: UserOperationRequest["maxPriorityFeePerGas"];
  },
];

export const alchemyRpcSchema = rpcSchema<AlchemyRpcSchema>();

// Extend viem's Client with a typed rundler RPC method.
export type PriorityFeeClient = Client & {
  request(args: {
    method: "rundler_maxPriorityFeePerGas";
    params: [];
  }): Promise<UserOperationRequest["maxPriorityFeePerGas"]>;
};

/**
 * Alchemy-flavoured `estimateFeesPerGas` callback for viem Bundler Clients.
 *
 * It fetches:
 * 1. `baseFeePerGas` from the latest block.
 * 2. `maxPriorityFeePerGas` via Alchemy's custom `rundler_maxPriorityFeePerGas` RPC.
 *
 * It then returns `maxFeePerGas = baseFee * 1.5 + priority`, mirroring Alchemy's AA-SDK logic.
 *
 * @param {PriorityFeeClient} bundlerClient  Bundler client with the rundler RPC method.
 * @returns {Promise<{maxFeePerGas: bigint, maxPriorityFeePerGas: bigint}>} Estimated fee values.
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyEstimateFeesPerGas } from "./alchemyEstimateFeesPerGas.js";
 *
 * const bundler = createBundlerClient({
 *   transport: http("<rundler-url>"),
 *   userOperation: {
 *     estimateFeesPerGas: alchemyEstimateFeesPerGas,
 *   },
 * });
 * ```
 */
export async function alchemyEstimateFeesPerGas({
  bundlerClient,
  account: _account,
  userOperation: _userOperation,
}: {
  bundlerClient: Client;
  account?: SmartAccount;
  userOperation?: UserOperationRequest;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  const rpcClient = bundlerClient as PriorityFeeClient;
  const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
    getBlock(bundlerClient, { blockTag: "latest" }),
    rpcClient.request({ method: "rundler_maxPriorityFeePerGas", params: [] }),
  ]);

  const baseFeePerGas = block.baseFeePerGas;
  if (baseFeePerGas == null) throw new Error("baseFeePerGas is null");
  if (maxPriorityFeePerGasEstimate == null)
    throw new Error("rundler_maxPriorityFeePerGas returned null or undefined");

  const maxPriorityFeePerGas =
    typeof maxPriorityFeePerGasEstimate === "bigint"
      ? maxPriorityFeePerGasEstimate
      : fromHex(maxPriorityFeePerGasEstimate as Hex, "bigint");

  return {
    maxPriorityFeePerGas,
    maxFeePerGas: (baseFeePerGas * 150n) / 100n + maxPriorityFeePerGas,
  };
}
