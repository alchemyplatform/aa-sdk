import type { Address } from "abitype";
import { isAddressEqual, type Prettify } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import deepEqual from "deep-equal";
import type { InnerWalletApiClient } from "../types";
import { LOGGER } from "../logger.js";
import { isLocalAccount } from "../utils/assertions.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_requestAccount";
    };
  }
>;

export type RequestAccountParams = Prettify<
  Omit<
    Extract<RpcSchema["Request"]["params"][0], { signerAddress: Address }>,
    "signerAddress" | "includeCounterfactualInfo"
  > &
    (
      | { signerAddress?: Address; accountAddress?: never }
      | { signerAddress?: never; accountAddress: Address }
    )
>;

export type RequestAccountResult = Prettify<{ address: Address }>;

/**
 * Requests a smart account address for the provided signer using the wallet API client.
 *
 * Note: This is only needed for non-EIP-7702 accounts. The client defaults to using
 * EIP-7702 with the signer's address, so you can call `prepareCalls` or `sendCalls`
 * directly without first calling `requestAccount`.
 *
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
 * // Request a non-7702 smart account
 * const account = await client.requestAccount();
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

  const signerAddress =
    (params && "signerAddress" in params ? params.signerAddress : undefined) ??
    (isLocalAccount(client.owner)
      ? client.owner.address
      : client.owner.account.address);

  const args =
    params && "accountAddress" in params && params.accountAddress
      ? {
          accountAddress: params.accountAddress,
          includeCounterfactualInfo: true,
        }
      : {
          ...params,
          signerAddress,
          includeCounterfactualInfo: true,
        };

  const cachedAccount = client.internal?.getAccount();

  if (
    cachedAccount &&
    ((args.accountAddress &&
      isAddressEqual(cachedAccount.address, args.accountAddress)) ||
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
