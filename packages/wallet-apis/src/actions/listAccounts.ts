import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { LOGGER } from "../logger.js";
import type { Address, Prettify } from "viem";
import { wallet_listAccounts as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { isLocalAccount } from "../utils/assertions.js";
import { Value } from "typebox/value";
import {
  methodSchema,
  type MethodParams,
  type MethodResponse,
} from "../utils/schema.js";

const schema = methodSchema(MethodSchema);
type BaseListAccountsParams = MethodParams<typeof MethodSchema>;
type ListAccountsResponse = MethodResponse<typeof MethodSchema>;

export type ListAccountsParams = Prettify<
  DistributiveOmit<
    BaseListAccountsParams,
    "signerAddress" | "signerPublicKey"
  > & {
    signerAddress?: Address;
    signerPublicKey?: never;
  }
>;

export type ListAccountsResult = ListAccountsResponse;

/**
 * Lists all smart accounts for a given signer using the wallet API client.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {ListAccountsParams} params - Parameters for listing accounts
 * @param {string} params.signerAddress - The address of the signer to list accounts for
 * @param {number} [params.limit] - Optional maximum number of accounts to return (default: 100, max: 100)
 * @param {string} [params.after] - Optional pagination cursor for fetching subsequent pages
 * @returns {Promise<ListAccountsResult>} A Promise that resolves to the list of accounts and pagination metadata
 *
 * @example
 * ```ts
 * // Fetch the first page of accounts
 * const firstPage = await client.listAccounts({
 *   signerAddress: "0x123...",
 *   limit: 10
 * });
 *
 * // If an 'after' cursor exists, use it to fetch the next page
 * const nextPage = await client.listAccounts({
 *   signerAddress: "0x123...",
 *   limit: 10,
 *   after: firstPage.meta.after
 * });
 * ```
 */
export async function listAccounts(
  client: InnerWalletApiClient,
  params: ListAccountsParams,
): Promise<ListAccountsResult> {
  const signerAddress =
    params.signerAddress ??
    (isLocalAccount(client.owner)
      ? client.owner.address
      : client.owner.account.address);

  LOGGER.debug("listAccounts:start", { hasAfter: !!params.after });

  const rpcParams = Value.Encode(schema.request, {
    ...params,
    signerAddress,
  } satisfies BaseListAccountsParams);

  const rpcResp = await client.request({
    method: "wallet_listAccounts",
    params: [rpcParams],
  });

  const res = Value.Decode(
    schema.response,
    rpcResp,
  ) satisfies ListAccountsResult;
  LOGGER.debug("listAccounts:done", { count: res.accounts.length });

  return res;
}
