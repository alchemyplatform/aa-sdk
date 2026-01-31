import { type Hex } from "viem";
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

export type SmartWalletActions = {
  requestAccount: (
    params?: RequestAccountParams,
  ) => Promise<RequestAccountResult>;
  prepareCalls: (params: PrepareCallsParams) => Promise<PrepareCallsResult>;
  sendPreparedCalls: (
    params: SendPreparedCallsParams,
  ) => Promise<SendPreparedCallsResult>;
  sendCalls: (params: SendCallsParams) => Promise<SendCallsResult>;
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
    params: GrantPermissionsParams,
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
 * Decorator that adds smart wallet actions to a wallet API client.
 * Provides both Alchemy-specific methods and standard viem wallet actions.
 *
 * @param {InnerWalletApiClient} client The wallet API client instance
 * @returns {SmartWalletActions} An object containing smart wallet action methods
 */
export const smartWalletActions = (
  client: InnerWalletApiClient,
): SmartWalletActions => ({
  // Alchemy methods.
  requestAccount: (params) => requestAccount(client, params),
  prepareCalls: (params) => prepareCalls(client, params),
  listAccounts: (params) => listAccounts(client, params),
  sendPreparedCalls: (params) => sendPreparedCalls(client, params),
  sendCalls: (params) => sendCalls(client, params), // TODO(v5): adapt this to fit viem's exact interface?
  signSignatureRequest: (params) => signSignatureRequest(client, params),
  signPreparedCalls: (params) => signPreparedCalls(client, params),
  signMessage: (params) => signMessage(client, params),
  signTypedData: (params) => signTypedData(client, params),
  grantPermissions: (params) => grantPermissions(client, params),
  // Viem methods.
  getCallsStatus: (params) => getCallsStatus(client, params),
  waitForCallsStatus: (params) => waitForCallsStatus(client, params),
  getCapabilities: (params) => getCapabilities(client, params),
});
