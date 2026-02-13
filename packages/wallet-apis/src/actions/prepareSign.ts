import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { wallet_prepareSign as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";

const schema = {
  request: MethodSchema.properties.Request.properties.params.items[0],
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type BasePrepareSignParams = Schema["Request"]["params"][0];
type PrepareSignResponse = Schema["ReturnType"];

export type PrepareSignParams = DistributiveOmit<
  BasePrepareSignParams,
  "from" | "chainId"
> & {
  account?: AccountParam;
  chainId?: number;
};

export type PrepareSignResult = PrepareSignResponse;

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
 *    account: "0x1234...",
 *    type: "personal_sign",
 *    data: "Hello, world!",
 * });
 * ```
 */
export async function prepareSign(
  client: InnerWalletApiClient,
  params: PrepareSignParams,
): Promise<PrepareSignResult> {
  const from = params.account
    ? resolveAddress(params.account)
    : client.account.address;

  LOGGER.debug("prepareSign:start", { type: params.signatureRequest.type });

  const { account: _, chainId: __, ...rest } = params;
  const rpcParams = Value.Encode(schema.request, {
    ...rest,
    from,
    chainId: params.chainId ?? client.chain.id,
  } satisfies BasePrepareSignParams);

  const rpcResp = await client.request({
    method: "wallet_prepareSign",
    params: [rpcParams],
  });

  LOGGER.debug("prepareSign:done");
  return Value.Decode(schema.response, rpcResp);
}
