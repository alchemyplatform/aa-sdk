import { getBlock } from "viem/actions";
import {
  type Client,
  isHex,
  type Transport,
  type Chain,
  hexToBigInt,
  type Account,
} from "viem";
import type {
  UserOperationRequest,
  SmartAccount,
  BundlerClient,
} from "viem/account-abstraction";
import { bigIntMultiply } from "@alchemy/common";
import type { RundlerRpcSchema } from "./schema.js";
import { InvalidHexValueError } from "./errors.js";

// Extend client with Rundler rpc schema.
export type RundlerClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
> = BundlerClient<
  transport,
  chain,
  account,
  Client | undefined,
  RundlerRpcSchema
>;

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
 * import { alchemyEstimateFeesPerGas } from "@alchemy/aa-infra";
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
  TAccount extends SmartAccount | Account | undefined =
    | SmartAccount
    | Account
    | undefined,
>({
  bundlerClient,
  account: _account,
  userOperation: _userOperation,
}: {
  bundlerClient: Client<TTransport, TChain, TAccount>;
  account?: SmartAccount;
  userOperation?: UserOperationRequest;
}): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  // Cast to RundlerClient to access rundler-specific RPC methods and BundlerClient properties.
  // This mirrors viem's pattern in prepareUserOperation.ts where they cast `client as unknown as BundlerClient`
  // to access bundler-specific properties from a base Client type.
  // See: https://github.com/wevm/viem/blob/d18b3b27/src/account-abstraction/actions/bundler/prepareUserOperation.ts#L355
  const rundlerClient = bundlerClient as unknown as RundlerClient;

  const [block, maxPriorityFeePerGasHex] = await Promise.all([
    // If the node rpc url is different from the bundler url, the public
    // client should be passed in when creating the bundler client, which
    // we can access here for public actions.
    getBlock(rundlerClient.client ?? rundlerClient, { blockTag: "latest" }),
    rundlerClient.request({
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
