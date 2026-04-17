import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient } from "../../types.ts";
import type { Address } from "viem";
import { metrics } from "../../metrics.js";
import type { SmartWalletSigner } from "../index.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_listAccounts";
    };
  }
>;

export type ListAccountsParams = Omit<
  RpcSchema["Request"]["params"][0],
  "signerAddress" | "signerPublicKey"
> & { signerAddress?: Address };

export type ListAccountsResult = RpcSchema["ReturnType"];

/**
 * Lists all smart accounts for a given signer using the wallet API client.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SmartAccountSigner} signer - The signer for which to list accounts
 * @param {ListAccountsParams} params - Parameters for listing accounts
 * @param {Address} [params.signerAddress] - The address of the signer to list accounts for
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
  signer: SmartWalletSigner,
  params: ListAccountsParams,
): Promise<ListAccountsResult> {
  metrics.trackEvent({
    name: "list_accounts",
  });

  // signerAddress in params takes priority; otherwise fallback to client's attached signer
  const signerAddress = params.signerAddress ?? (await signer.getAddress());
  const { signerAddress: _signerAddress, ...rest } = params;

  return client.request({
    method: "wallet_listAccounts",
    params: [
      {
        ...rest,
        signerAddress,
      },
    ],
  });
}
