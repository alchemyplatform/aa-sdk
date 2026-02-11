import type { Address } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { wallet_prepareSign as MethodSchema } from "@alchemy/wallet-api-types/rpc";
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
type BasePrepareSignParams = Schema["Request"]["params"][0];
type PrepareSignResponse = Schema["ReturnType"];

export type PrepareSignParams = DistributiveOmit<
  BasePrepareSignParams,
  "from" | "chainId"
> & {
  from?: Address;
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

  const rpcParams = Value.Encode(schema.request, {
    ...params,
    from,
    chainId: params.chainId ?? client.chain.id,
  } satisfies BasePrepareSignParams);

  const rpcResp = await client.request({
    method: "wallet_prepareSign",
    params: [rpcParams],
  });

  LOGGER.debug("prepareSign:done");
  return Value.Decode(schema.response, rpcResp) satisfies PrepareSignResult;
}
