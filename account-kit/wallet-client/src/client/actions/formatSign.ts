import type { Static } from "@sinclair/typebox";
import type { wallet_formatSign } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient, WithoutChainId } from "../../types.ts";
import { toHex, type Address, type IsUndefined } from "viem";
import { AccountNotFoundError } from "@aa-sdk/core";

export type FormatSignParams<
  TAccount extends Address | undefined = Address | undefined,
> = Omit<
  WithoutChainId<
    Static<
      (typeof wallet_formatSign)["properties"]["Request"]["properties"]["params"]
    >[0]
  >,
  "from"
> &
  (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never });

export type FormatSignResult = Static<typeof wallet_formatSign>["ReturnType"];

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
export async function formatSign<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: FormatSignParams<TAccount>,
): Promise<FormatSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  return client.request({
    method: "wallet_formatSign",
    params: [{ ...params, from, chainId: toHex(client.chain.id) }],
  });
}
