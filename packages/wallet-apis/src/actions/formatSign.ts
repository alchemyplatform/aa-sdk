import type { Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { wallet_formatSign as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import { Value } from "typebox/value";
import {
  methodSchema,
  type MethodParams,
  type MethodResponse,
} from "../utils/schema.js";

const schema = methodSchema(MethodSchema);
type BaseFormatSignParams = MethodParams<typeof MethodSchema>;
type FormatSignResponse = MethodResponse<typeof MethodSchema>;

export type FormatSignParams = Prettify<
  DistributiveOmit<BaseFormatSignParams, "from" | "chainId"> & {
    account?: AccountParam;
    chainId?: number;
  }
>;

export type FormatSignResult = FormatSignResponse;

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
 *    account: "0x1234...",
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
  const from = params.account
    ? resolveAddress(params.account)
    : client.account.address;

  LOGGER.debug("formatSign:start");

  const { account: _, chainId: __, ...rest } = params;
  const rpcParams = Value.Encode(schema.request, {
    ...rest,
    from,
    chainId: params.chainId ?? client.chain.id,
  } satisfies BaseFormatSignParams);

  const rpcResp = await client.request({
    method: "wallet_formatSign",
    params: [rpcParams],
  });

  LOGGER.debug("formatSign:done");
  return Value.Decode(schema.response, rpcResp);
}
