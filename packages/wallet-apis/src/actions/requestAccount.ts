import type { Static } from "@sinclair/typebox";
import type { Address } from "abitype";
import type { Prettify, UnionOmit } from "viem";
import type { wallet_requestAccount } from "@alchemy/wallet-api-types/rpc";
import deepEqual from "deep-equal";
import type { InnerWalletApiClient, SignerClient } from "../types";

export type RequestAccountParams = Prettify<
  UnionOmit<
    Static<typeof wallet_requestAccount>["Request"]["params"][0],
    "includeCounterfactualInfo"
  >
>;

export type RequestAccountResult = Prettify<{ address: Address }>;

/**
 * Requests an account for the provided signer using the wallet API client.
 * If an account already exists for the signer, it will always return that account unless a new ID is specified.
 * If an account already exists, the creationHint will be ignored.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SignerClient} signerClient - The wallet client to use for signing
 * @param {RequestAccountParams} [params] - Optional parameters for requesting a specific account
 * @param {string} [params.id] - Optional identifier for the account. If specified, a new account with this ID will be created even if one already exists for the signer
 * @param {object} [params.creationHint] - Optional hints to guide account creation. These are ignored if an account already exists
 * @returns {Promise<RequestAccountResult>} A Promise that resolves to an object containing a smart account address
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
  signerClient: SignerClient,
  params?: RequestAccountParams,
): Promise<RequestAccountResult> {
  const args =
    client.account && !params
      ? {
          accountAddress: client.account.address,
          includeCounterfactualInfo: true,
        }
      : params != null && "accountAddress" in params
        ? {
            accountAddress: params.accountAddress,
            includeCounterfactualInfo: true,
          }
        : {
            signerAddress:
              params?.signerAddress ?? signerClient.account.address,
            includeCounterfactualInfo: true,
          };

  const cachedAccount = client.internal.getAccount();

  if (
    cachedAccount &&
    ((args.accountAddress && cachedAccount.address === args.accountAddress) ||
      deepEqual(cachedAccount.requestParams, args, { strict: true }))
  ) {
    return {
      address: cachedAccount.address,
    };
  }

  const resp = await client.request({
    method: "wallet_requestAccount",
    params: [args],
  });

  client.internal.setAccount({
    address: resp.accountAddress,
    requestParams: args,
  });

  return {
    address: resp.accountAddress,
  };
}
