import type { Address, Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { wallet_formatSign as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";

const schema = {
  request: MethodSchema.properties.Request.properties.params.items[0],
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type BaseFormatSignParams = Schema["Request"]["params"][0];
type FormatSignResponse = Schema["ReturnType"];

export type FormatSignParams = Prettify<
  DistributiveOmit<BaseFormatSignParams, "from" | "chainId"> & {
    from?: Address;
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

  const rpcParams = Value.Encode(schema.request, {
    ...params,
    from,
    chainId: params.chainId ?? client.chain.id,
  } satisfies BaseFormatSignParams);

  const rpcResp = await client.request({
    method: "wallet_formatSign",
    params: [rpcParams],
  });

  LOGGER.debug("formatSign:done");
  return Value.Decode(schema.response, rpcResp) satisfies FormatSignResult;
}
