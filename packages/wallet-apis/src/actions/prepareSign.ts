import type { InnerWalletApiClient } from "../types.ts";
import type { Prettify } from "viem";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import type { PrepareSignParams as ViemPrepareSignParams } from "../utils/viemTypes.js";
import { toRpcPrepareSignParams } from "../utils/viemDecode.js";
import { fromRpcPrepareSignResult } from "../utils/viemEncode.js";
import type { PrepareSignResult as ViemPrepareSignResult } from "../utils/viemTypes.js";

// Input params use viem-native types
export type PrepareSignParams = Prettify<ViemPrepareSignParams>;

// Result uses viem-native types
export type PrepareSignResult = Prettify<ViemPrepareSignResult>;

/**
 * Prepares a signature request for signing messages or transactions.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareSignParams} params - Parameters for preparing the signature request
 * @returns {Promise<PrepareSignResult>} A Promise that resolves to the prepare sign result containing a signature request
 *
 * @example
 * ```ts
 * // Prepare a message to be signed
 * const result = await client.prepareSign({
 *    from: "0x1234...",
 *    type: "personal_sign",
 *    data: "Hello, world!",
 * });
 * ```
 */
export async function prepareSign(
  client: InnerWalletApiClient,
  params: PrepareSignParams,
): Promise<PrepareSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    LOGGER.warn("prepareSign:no-from", { hasClientAccount: !!client.account });
    throw new AccountNotFoundError();
  }

  LOGGER.debug("prepareSign:start", { type: params.signatureRequest.type });

  // Convert viem-native params to RPC format
  const rpcParams = toRpcPrepareSignParams(params, client.chain.id, from);

  const res = await client.request({
    method: "wallet_prepareSign",
    // Cast to satisfy RPC schema - our converted params match the expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: [rpcParams as any],
  });

  LOGGER.debug("prepareSign:done");

  // Convert RPC result to viem-native format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fromRpcPrepareSignResult(res as any);
}
