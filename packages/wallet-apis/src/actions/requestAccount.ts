import type { Static } from "@sinclair/typebox";
import type { Address } from "abitype";
import { type Prettify } from "viem";
import type { wallet_requestAccount } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient } from "../types.js";

export type RequestAccountParams = Prettify<
  Omit<
    Extract<
      Static<typeof wallet_requestAccount>["Request"]["params"][0],
      { signerAddress: Address }
    >,
    "signerAddress" | "includeCounterfactualInfo"
  > & { accountAddress?: Address }
>;

export type RequestAccountResult = Prettify<
  Static<typeof wallet_requestAccount>["ReturnType"]
>;

/**
 * Requests an account for the provided signer using the wallet API client.
 * If an account already exists for the signer, it will always return that account unless a new ID is specified.
 * If an account already exists, the creationHint will be ignored.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SmartAccountSigner} signer - The signer that will be associated with the account
 * @param {RequestAccountParams} [params] - Optional parameters for requesting a specific account
 * @param {string} [params.id] - Optional identifier for the account. If specified, a new account with this ID will be created even if one already exists for the signer
 * @param {object} [params.creationHint] - Optional hints to guide account creation. These are ignored if an account already exists
 * @returns {Promise<RequestAccountResult>} A Promise that resolves to a SmartContractAccount instance
 *
 * @example
 * ```ts
 * // Request an account with default parameters using a local signer
 * const signer = LocalAccountSigner.privateKeyToAccountSigner("0x...");
 * const account = await client.requestAccount(signer);
 * ```
 */
export async function requestAccount(
  client: InnerWalletApiClient,
  params?: RequestAccountParams,
): Promise<RequestAccountResult> {
  const args =
    (client.account && !params) || params?.accountAddress
      ? {
          accountAddress: params?.accountAddress ?? client.account!.address,
          includeCounterfactualInfo: true,
        }
      : {
          ...params,
          signerAddress: client.account!.address, // TODO(jh): is this safe?
          includeCounterfactualInfo: true,
        };

  // const cachedAccount = client.internal.getAccount();

  // if (
  //   cachedAccount &&
  //   ((args.accountAddress &&
  //     cachedAccount.account.address === args.accountAddress) ||
  //     deepEqual(cachedAccount.requestParams, args, { strict: true }))
  // ) {
  //   return cachedAccount.account;
  // }

  const account = await client.request({
    method: "wallet_requestAccount",
    params: [args],
  });

  // client.internal.setAccount({ account, requestParams: args });

  return account;
}
