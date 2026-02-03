import type { Address, Hex, Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import { toRpcFormatSignParams } from "../utils/viemDecode.js";
import { fromRpcFormatSignResult } from "../utils/viemEncode.js";

export type FormatSignParams = Prettify<{
  from?: Address;
  chainId?: number;
  signature: {
    type: "ecdsa";
    data: Hex;
  };
}>;

export type FormatSignResult = Prettify<{
  signature: Hex;
}>;

/**
 * Formats a signature request for signing messages or transactions.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {FormatSignParams} params - Parameters for formatting the signature
 * @returns {Promise<FormatSignResult>} A Promise that resolves to the formatSign result containing the formatted signature.
 *
 * @example
 * ```ts
 * // Formats a signature
 * const result = await client.formatSign({
 *    from: "0x1234...",
 *    signature: {
 *      type: "ecdsa",
 *      data: "0xabcd..."
 *    },
 * });
 * ```
 */
export async function formatSign(
  client: InnerWalletApiClient,
  params: FormatSignParams,
): Promise<FormatSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  LOGGER.debug("formatSign:start");

  const rpcParams = toRpcFormatSignParams(params, client.chain.id, from);

  const res = await client.request({
    method: "wallet_formatSign",
    params: [rpcParams],
  });

  LOGGER.debug("formatSign:done");

  return fromRpcFormatSignResult(res);
}
