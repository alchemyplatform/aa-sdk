import type { SmartAccountSigner } from "@aa-sdk/core";
import type { Address, Hex } from "viem";
import {
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
} from "viem/actions";
import type { InnerWalletApiClient } from "../types.ts";
import {
  getCallsStatus,
  type GetCallsStatusParams,
  type GetCallsStatusResult,
} from "./actions/getCallsStatus.js";
import {
  grantPermissions,
  type GrantPermissionsParams,
  type GrantPermissionsResult,
} from "./actions/grantPermissions.js";
import {
  listAccounts,
  type ListAccountsParams,
  type ListAccountsResult,
} from "./actions/listAccounts.js";
import {
  prepareCalls,
  type PrepareCallsParams,
  type PrepareCallsResult,
} from "./actions/prepareCalls.js";
import {
  requestAccount,
  type RequestAccountParams,
  type RequestAccountResult,
} from "./actions/requestAccount.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsParams,
  type SendPreparedCallsResult,
} from "./actions/sendPreparedCalls.js";
import { waitForCallsStatus } from "./actions/waitForCallsStatus.js";
import { signMessage, type SignMessageParams } from "./actions/signMessage.js";
import {
  signSignatureRequest,
  type SignSignatureRequestParams,
  type SignSignatureRequestResult,
} from "./actions/signSignatureRequest.js";
import {
  signTypedData,
  type SignTypedDataParams,
} from "./actions/signTypedData.js";
import {
  signPreparedCalls,
  type SignPreparedCallsParams,
  type SignPreparedCallsResult,
} from "./actions/signPreparedCalls.js";
import {
  sendCalls,
  type SendCallsParams,
  type SendCallsResult,
} from "./actions/sendCalls.js";
import {
  onramp,
  type OnrampParams,
  type OnrampResult,
} from "./actions/onramp.js";

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
  onramp: (params?: OnrampParams) => Promise<OnrampResult>;
};

export function smartWalletClientActions<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  signer: SmartAccountSigner,
): SmartWalletActions<TAccount> {
  return {
    requestAccount: (params) => requestAccount(client, signer, params),
    prepareCalls: (params) => prepareCalls(client, params),
    listAccounts: (params) => listAccounts(client, signer, params),
    sendPreparedCalls: (params) => sendPreparedCalls(client, params),
    sendCalls: (params) => sendCalls(client, signer, params),
    getCallsStatus: (params) => getCallsStatus(client, params),
    waitForCallsStatus: (params) => waitForCallsStatus(client, params),
    signSignatureRequest: (params) => signSignatureRequest(signer, params),
    signPreparedCalls: (params) => signPreparedCalls(signer, params),
    signMessage: (params) => signMessage(client, signer, params),
    signTypedData: (params) => signTypedData(client, signer, params),
    grantPermissions: (params) => grantPermissions(client, signer, params),
    onramp: (params) => onramp(params),
  };
}
