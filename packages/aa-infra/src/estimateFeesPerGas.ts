import {
  type Client,
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
import type { RundlerRpcSchema } from "./schema.js";

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
 * A custom `estimateFeesPerGas` function for viem bundler clients to use `rundler_getUserOperationGasPrice` for fee estimation.
 *
 * It fetches gas price via `rundler_getUserOperationGasPrice` and returns the
 * `suggested.maxFeePerGas` and `suggested.maxPriorityFeePerGas` values directly.
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

  const { suggested } = await rundlerClient.request({
    method: "rundler_getUserOperationGasPrice",
    params: [],
  });

  return {
    maxPriorityFeePerGas: hexToBigInt(suggested.maxPriorityFeePerGas),
    maxFeePerGas: hexToBigInt(suggested.maxFeePerGas),
  };
}
