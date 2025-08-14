import type { Hex, Address } from "viem";
import {
  requestAccount,
  type RequestAccountParams,
  type RequestAccountResult,
} from "../actions/requestAccount.js";
import {
  prepareCalls,
  type PrepareCallsParams,
  type PrepareCallsResult,
} from "../actions/prepareCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsParams,
  type SendPreparedCallsResult,
} from "../actions/sendPreparedCalls.js";
import {
  sendCalls,
  type SendCallsParams,
  type SendCallsResult,
} from "../actions/sendCalls.js";
import {
  listAccounts,
  type ListAccountsParams,
  type ListAccountsResult,
} from "../actions/listAccounts.js";
import {
  signSignatureRequest,
  type SignSignatureRequestParams,
  type SignSignatureRequestResult,
} from "../actions/signSignatureRequest.js";
import {
  signPreparedCalls,
  type SignPreparedCallsParams,
  type SignPreparedCallsResult,
} from "../actions/signPreparedCalls.js";
import { signMessage, type SignMessageParams } from "../actions/signMessage.js";
import {
  signTypedData,
  type SignTypedDataParams,
} from "../actions/signTypedData.js";
import {
  grantPermissions,
  type GrantPermissionsParams,
  type GrantPermissionsResult,
} from "../actions/grantPermissions.js";
import type { BaseWalletClient } from "../types.js";
import { createInternalState } from "../internal.js";

export type SmartWalletActions<
  TAccount extends Address | undefined = Address | undefined,
> = {
  smartAccountAddress: TAccount;
  requestAccount: (
    params?: RequestAccountParams,
  ) => Promise<RequestAccountResult>;
  prepareCalls: (
    params: PrepareCallsParams<TAccount>,
  ) => Promise<PrepareCallsResult>;
  sendPreparedCalls: (
    params: SendPreparedCallsParams,
  ) => Promise<SendPreparedCallsResult>;
  sendCalls: (params: SendCallsParams<TAccount>) => Promise<SendCallsResult>;
  listAccounts: (params: ListAccountsParams) => Promise<ListAccountsResult>;
  signSignatureRequest: (
    params: SignSignatureRequestParams,
  ) => Promise<SignSignatureRequestResult>;
  signPreparedCalls: (
    params: SignPreparedCallsParams,
  ) => Promise<SignPreparedCallsResult>;
  signMessage: (params: SignMessageParams) => Promise<Hex>;
  signTypedData: (params: SignTypedDataParams) => Promise<Hex>;
  grantPermissions: (
    params: GrantPermissionsParams<TAccount>,
  ) => Promise<GrantPermissionsResult>;
};

type SmartWalletDecoratorParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  policyIds?: string[];
  smartAccountAddress: TAccount;
};

/**
 * This is a decorator that is used to add smart wallet actions to a client.
 *
 * @param {SmartWalletDecoratorParams} params The global parameters for the smart wallet actions, including an optional paymaster policy ID.
 * @returns {Function} A client decorator with smart wallet actions added.
 */
export function smartWalletActions<
  // TODO(jh): does this generic even do anything now that the client.account is the SIGNER and not the SCA address? ideally we can call the actions w/ typesafety based on the account being present in the internal cache or not.
  TAccount extends Address | undefined = Address | undefined, // TODO(jh): note this is the SCA ADDRESS, NOT the signer account address. does this still behave correctly?
>(
  params: SmartWalletDecoratorParams<TAccount>,
): (client: BaseWalletClient) => SmartWalletActions<TAccount> {
  return (client) => {
    const _client = client.extend(() => ({
      policyIds: params.policyIds,
      internal: createInternalState(),
    }));

    return {
      smartAccountAddress: params.smartAccountAddress,
      requestAccount: (params) => requestAccount(_client, params),
      prepareCalls: (params) => prepareCalls(_client, params),
      listAccounts: (params) => listAccounts(_client, params),
      sendPreparedCalls: (params) => sendPreparedCalls(_client, params),
      sendCalls: (params) => sendCalls(_client, params),
      signSignatureRequest: (params) => signSignatureRequest(_client, params),
      signPreparedCalls: (params) => signPreparedCalls(_client, params),
      signMessage: (params) => signMessage(_client, params),
      signTypedData: (params) => signTypedData(_client, params),
      grantPermissions: (params) => grantPermissions(_client, params),
    };
  };
}
