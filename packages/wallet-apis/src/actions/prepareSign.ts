import type { Address, Prettify } from "viem";
import type {
  InnerWalletApiClient,
  SignableMessage,
  TypedData,
} from "../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import { toRpcPrepareSignParams } from "../utils/viemDecode.js";
import { fromRpcPrepareSignResult } from "../utils/viemEncode.js";

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export type PrepareSignParams = Prettify<{
  from?: Address;
  chainId?: number;
  signatureRequest:
    | { type: "personal_sign"; data: SignableMessage }
    | { type: "eth_signTypedData_v4"; data: TypedData };
}>;

export type PrepareSignResult = Prettify<{
  chainId: number;
  signatureRequest:
    | { type: "personal_sign"; data: SignableMessage }
    | { type: "eth_signTypedData_v4"; data: TypedData };
}>;

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
    params: [rpcParams],
  });

  LOGGER.debug("prepareSign:done");

  // Convert RPC result to viem-native format
  return fromRpcPrepareSignResult(res);
}
