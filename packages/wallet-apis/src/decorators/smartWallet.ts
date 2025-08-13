import type {
  Hex,
  WaitForCallsStatusParameters,
  WaitForCallsStatusReturnType,
  Address,
} from "viem";
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
  getCallsStatus,
  type GetCallsStatusParams,
  type GetCallsStatusResult,
} from "../actions/getCallsStatus.js";
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
import { waitForCallsStatus } from "../actions/waitForCallsStatus.js";

import type { InnerWalletApiClient } from "../types";

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
  getCallsStatus: (
    params: GetCallsStatusParams,
  ) => Promise<GetCallsStatusResult>;
  waitForCallsStatus: (
    params: WaitForCallsStatusParameters,
  ) => Promise<WaitForCallsStatusReturnType>;
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

// TODO(jh): figure out exactly how this is used. do you extend a viem walletclient w/ it & it turns it into a smart wallet client?
/**
 * This is a decorator that is used to add smart wallet actions to a client.
 *
 * @param {object} client - The client to add the actions to.
 * @returns {object} - The client with the actions added.
 */
// export const smartWalletActions: <
//   TChain extends Chain | undefined = Chain | undefined,
//   TAccount extends Account | undefined = Account | undefined,
// >(
//   client: Client<AlchemyTransport, TChain, TAccount>,
// ) => GasManagerActions = (client) => ({
//   requestAccount: (params) => requestGasAndPaymasterAndData(client, params),
// });
export function smartWalletClientActions<
  TAccount extends Address | undefined = Address | undefined, // TODO(jh): note this is the SCA ADDRESS.
>(
  client: InnerWalletApiClient, // TODO(jh): more generic type here?
  // signer: SmartAccountSigner, // TODO(jh): can we use the account.owner?
): SmartWalletActions<TAccount> {
  // TODO(jh): do we just use the client to sign & the signer on the client is managed upstream?
  return {
    requestAccount: (params) => requestAccount(client, params),
    prepareCalls: (params) => prepareCalls(client, params),
    listAccounts: (params) => listAccounts(client, params),
    sendPreparedCalls: (params) => sendPreparedCalls(client, params),
    sendCalls: (params) => sendCalls(client, params),
    getCallsStatus: (params) => getCallsStatus(client, params),
    waitForCallsStatus: (params) => waitForCallsStatus(client, params),
    signSignatureRequest: (params) => signSignatureRequest(client, params),
    signPreparedCalls: (params) => signPreparedCalls(client, params),
    signMessage: (params) => signMessage(client, params),
    signTypedData: (params) => signTypedData(client, params),
    grantPermissions: (params) => grantPermissions(client, params),
  };
}
// TODO(jh): cache account like we did in v4?
// TODO(jh): should we pass policyId to this?
