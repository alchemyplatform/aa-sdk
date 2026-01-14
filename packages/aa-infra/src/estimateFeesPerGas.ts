import { getBlock } from "viem/actions";
import {
  type Client,
  isHex,
  type Transport,
  type Chain,
  type Account,
  hexToBigInt,
} from "viem";
import type {
  UserOperationRequest,
  SmartAccount,
} from "viem/account-abstraction";
import { bigIntMultiply } from "@alchemy/common";
import type { RundlerRpcSchema } from "./schema.js";
import { InvalidHexValueError } from "./errors.js";

// Extend client with Rundler rpc schema.
export type RundlerClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = Client<transport, chain, account, RundlerRpcSchema>;

/**
 * A custom `estimateFeesPerGas` function for viem bundler clients to use `rundler_maxPriorityFeePerGas` for priority fee estimation.
 *
 * It fetches:
 * 1. `baseFeePerGas` from the latest block.
 * 2. `maxPriorityFeePerGas` via `rundler_maxPriorityFeePerGas`.
 *
 * It then returns `maxFeePerGas = baseFee * 1.5 + priority` (aligns with viem default).
 *
 * @param {RundlerClient} bundlerClient Bundler client with the rundler RPC method.
 * @returns {Promise<{maxFeePerGas: bigint, maxPriorityFeePerGas: bigint}>} Estimated fee values.
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { estimateFeesPerGas as alchemyEstimateFeesPerGas } from "@alchemy/aa-infra";
 *
 * const bundler = createBundlerClient({
 *   transport: http("<rundler-url>"),
 *   userOperation: {
 *     estimateFeesPerGas: alchemyEstimateFeesPerGas,
 *   },
 * });
 * ```
 */
export async function estimateFeesPerGas<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>({
  bundlerClient,
  account: _account,
  userOperation: _userOperation,
}: {
  bundlerClient: RundlerClient<TTransport, TChain, TAccount>;
  account?: SmartAccount;
  userOperation?: UserOperationRequest;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  const [block, maxPriorityFeePerGasHex] = await Promise.all([
    getBlock(bundlerClient, { blockTag: "latest" }), // This is technically hitting the node rpc, not rundler.
    bundlerClient.request({
      method: "rundler_maxPriorityFeePerGas",
      params: [],
    }),
  ]);

  const baseFeePerGas = block.baseFeePerGas;
  if (baseFeePerGas == null) {
    throw new Error("baseFeePerGas is null");
  }
  if (maxPriorityFeePerGasHex == null) {
    throw new Error("rundler_maxPriorityFeePerGas returned null or undefined");
  }
  if (!isHex(maxPriorityFeePerGasHex)) {
    throw new InvalidHexValueError(maxPriorityFeePerGasHex);
  }
  const maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGasHex);

  return {
    maxPriorityFeePerGas,
    maxFeePerGas: bigIntMultiply(baseFeePerGas, 1.5) + maxPriorityFeePerGas,
  };
}
