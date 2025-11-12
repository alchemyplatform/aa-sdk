import type { Address } from "abitype";
import type { Prettify, UnionOmit } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import deepEqual from "deep-equal";
import type { InnerWalletApiClient, OptionalSignerAddress } from "../types";
import { LOGGER } from "../logger.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_requestAccount";
    };
  }
>;

export type RequestAccountParams = Prettify<
  OptionalSignerAddress<
    UnionOmit<RpcSchema["Request"]["params"][0], "includeCounterfactualInfo">
  >
>;

export type RequestAccountResult = Prettify<{ address: Address }>;

/**
 * Requests an account for the provided signer using the wallet API client.
 * If an account already exists for the signer, it will always return that account unless a new ID is specified.
 * If an account already exists, the creationHint will be ignored.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
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
  params?: RequestAccountParams,
): Promise<RequestAccountResult> {
  LOGGER.debug("requestAccount:start", {
    hasParams: !!params,
    hasAccountOnClient: !!client.account,
  });
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
            ...params,
            signerAddress:
              (params && "signerAddress" in params
                ? params.signerAddress
                : undefined) ?? client.owner.account.address,
            includeCounterfactualInfo: true,
          };

  const cachedAccount = client.internal?.getAccount();

  if (
    cachedAccount &&
    ((args.accountAddress && cachedAccount.address === args.accountAddress) ||
      deepEqual(cachedAccount.requestParams, args, { strict: true }))
  ) {
    LOGGER.debug("requestAccount:cache-hit", {
      address: cachedAccount.address,
    });
    return {
      address: cachedAccount.address,
    };
  }

  const resp = await client.request({
    method: "wallet_requestAccount",
    params: [args],
  });

  client.internal?.setAccount({
    address: resp.accountAddress,
    requestParams: args,
  });

  LOGGER.debug("requestAccount:done", { address: resp.accountAddress });
  return {
    address: resp.accountAddress,
  };
}
