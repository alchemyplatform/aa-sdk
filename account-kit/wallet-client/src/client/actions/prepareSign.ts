import type { InnerWalletApiClient } from "../../types.ts";
import { toHex, type Address, type IsUndefined } from "viem";
import { AccountNotFoundError } from "@aa-sdk/core";
import type { Static } from "@sinclair/typebox";
import { wallet_prepareSign } from "@alchemy/wallet-api-types/rpc";

export type PrepareSignParams<
  TAccount extends Address | undefined = Address | undefined,
> = Omit<
  Static<
    (typeof wallet_prepareSign)["properties"]["Request"]["properties"]["params"]
  >[0],
  "from" | "chainId"
> &
  (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never });

export type PrepareSignResult = Static<typeof wallet_prepareSign>["ReturnType"];

/**
 * Prepares a signature request for signing messages or transactions.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareSignParams} params - Parameters for preparing the signature request
 * @returns {Promise<PrepareSignResult>} A Promise that resolves to the prepare sign result containing a signature request
 *
 * @example
 * // Prepare a message to be signed
 * const result = await client.prepareSign({
 *    from: "0x1234...",
 *    type: "personal_sign",
 *    data: "Hello, world!",
 * });
 */
export async function prepareSign<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: PrepareSignParams<TAccount>,
): Promise<PrepareSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  return client.request({
    method: "wallet_prepareSign",
    params: [{ ...params, from, chainId: toHex(client.chain.id) }],
  });
}
