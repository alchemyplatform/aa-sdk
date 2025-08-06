import { getBlock } from "viem/actions";
import {
  fromHex,
  type Client,
  rpcSchema,
  isHex,
  type Transport,
  type Chain,
  type Account,
} from "viem";
import type {
  UserOperationRequest,
  SmartAccount,
} from "viem/account-abstraction";
import { BaseError, bigIntMultiply } from "@alchemy/common";
import type { AlchemyRpcSchema } from "./types";

export const alchemyRpcSchema = rpcSchema<AlchemyRpcSchema>();

/**
 * Error thrown when an invalid hex value is encountered during fee estimation.
 */
export class InvalidHexValueError extends BaseError {
  override name = "InvalidHexValueError";

  constructor(value: unknown) {
    super(`Invalid hex value: ${value}`);
  }
}

// Extend viem's Client with a typed rundler RPC method.
export type PriorityFeeClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = Client<transport, chain, account, AlchemyRpcSchema>;

/**
 * Alchemy-flavoured `estimateFeesPerGas` callback for viem Bundler Clients.
 *
 * It fetches:
 * 1. `baseFeePerGas` from the latest block.
 * 2. `maxPriorityFeePerGas` via Alchemy's custom `rundler_maxPriorityFeePerGas` RPC.
 *
 * It then returns `maxFeePerGas = baseFee * 1.5 + priority` (aligns with viem default).
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
  bundlerClient: PriorityFeeClient;
  account?: SmartAccount;
  userOperation?: UserOperationRequest;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
    getBlock(bundlerClient, { blockTag: "latest" }),
    bundlerClient.request({
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
