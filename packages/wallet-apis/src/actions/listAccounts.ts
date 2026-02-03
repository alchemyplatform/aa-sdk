import type { InnerWalletApiClient } from "../types.ts";
import { LOGGER } from "../logger.js";
import type { Address, Prettify } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import { isLocalAccount } from "../utils/assertions.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_listAccounts";
    };
  }
>;

export type ListAccountsParams = Prettify<
  Omit<
    RpcSchema["Request"]["params"][0],
    "signerAddress" | "signerPublicKey"
  > & {
    signerAddress?: Address;
    signerPublicKey?: never;
  }
>;

export type ListAccountsResult = Prettify<RpcSchema["ReturnType"]>;

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
  const res = await client.request({
    method: "wallet_listAccounts",
    params: [
      {
        ...params,
        signerAddress,
      },
    ],
  });
  LOGGER.debug("listAccounts:done", { count: res.accounts.length });

  return res;
}
