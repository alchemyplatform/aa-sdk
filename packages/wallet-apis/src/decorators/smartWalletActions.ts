import { type Hex, type Address } from "viem";
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
import type { InnerWalletApiClient } from "../types.js";
import type { SignerClient } from "../types.js";
import {
  getCallsStatus,
  waitForCallsStatus,
  getCapabilities,
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
  type GetCapabilitiesParameters,
  type GetCapabilitiesReturnType,
} from "viem/actions";

export type SmartWalletActions<
  TAccount extends Address | undefined = Address | undefined,
> = {
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
  getCallsStatus: (
    params: GetCallsStatusParameters,
  ) => Promise<GetCallsStatusReturnType>;
  waitForCallsStatus: (
    params: WaitForCallsStatusParameters,
  ) => Promise<WaitForCallsStatusReturnType>;
  getCapabilities: (
    params?: GetCapabilitiesParameters | undefined,
  ) => Promise<GetCapabilitiesReturnType>;
};

/**
 * This is a decorator that is used to add smart wallet actions to a client.
 *
 * @param {SignerClient} signerClient The signer client for signing operations
 * @returns {Function} A function that takes an InnerWalletApiClient and returns smart wallet actions
 */
export const smartWalletActions =
  <TAccount extends Address | undefined = Address | undefined>(
    signerClient: SignerClient,
  ) =>
  (client: InnerWalletApiClient): SmartWalletActions<TAccount> => ({
    // Alchemy methods.
    requestAccount: (params) => requestAccount(client, signerClient, params),
    prepareCalls: (params) => prepareCalls(client, params),
    listAccounts: (params) => listAccounts(client, signerClient, params),
    sendPreparedCalls: (params) => sendPreparedCalls(client, params),
    sendCalls: (params) => sendCalls(client, signerClient, params), // TODO(v5): adapt this to fit viem's exact interface?
    signSignatureRequest: (params) =>
      signSignatureRequest(signerClient, params),
    signPreparedCalls: (params) => signPreparedCalls(signerClient, params),
    signMessage: (params) => signMessage(client, signerClient, params),
    signTypedData: (params) => signTypedData(client, signerClient, params),
    grantPermissions: (params) =>
      grantPermissions(client, signerClient, params),
    // Viem methods.
    getCallsStatus: (params) => getCallsStatus(client, params),
    waitForCallsStatus: (params) => waitForCallsStatus(client, params),
    getCapabilities: (params) => getCapabilities(client, params),
  });
