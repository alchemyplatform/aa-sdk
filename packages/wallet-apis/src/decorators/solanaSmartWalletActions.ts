import type { InnerSolanaWalletApiClient } from "../types.js";
import {
  prepareCalls,
  type SolanaPrepareCallsParams,
  type SolanaPrepareCallsResult,
} from "../actions/solana/prepareCalls.js";
import {
  signPreparedCalls,
  type SolanaSignPreparedCallsParams,
  type SolanaSignPreparedCallsResult,
} from "../actions/solana/signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SolanaSendPreparedCallsParams,
  type SolanaSendPreparedCallsResult,
} from "../actions/solana/sendPreparedCalls.js";
import {
  sendCalls,
  type SolanaSendCallsParams,
  type SolanaSendCallsResult,
} from "../actions/solana/sendCalls.js";
import {
  getCallsStatus,
  type SolanaGetCallsStatusParams,
  type SolanaGetCallsStatusResult,
} from "../actions/solana/getCallsStatus.js";
import {
  waitForCallsStatus,
  type SolanaWaitForCallsStatusParams,
  type SolanaWaitForCallsStatusResult,
} from "../actions/solana/waitForCallsStatus.js";

export type SolanaSmartWalletActions = {
  prepareCalls: (
    params: SolanaPrepareCallsParams,
  ) => Promise<SolanaPrepareCallsResult>;
  signPreparedCalls: (
    params: SolanaSignPreparedCallsParams,
  ) => Promise<SolanaSignPreparedCallsResult>;
  sendPreparedCalls: (
    params: SolanaSendPreparedCallsParams,
  ) => Promise<SolanaSendPreparedCallsResult>;
  sendCalls: (params: SolanaSendCallsParams) => Promise<SolanaSendCallsResult>;
  getCallsStatus: (
    params: SolanaGetCallsStatusParams,
  ) => Promise<SolanaGetCallsStatusResult>;
  waitForCallsStatus: (
    params: SolanaWaitForCallsStatusParams,
  ) => Promise<SolanaWaitForCallsStatusResult>;
};

export const solanaSmartWalletActions = (
  client: InnerSolanaWalletApiClient,
): SolanaSmartWalletActions => ({
  prepareCalls: (params) => prepareCalls(client, params),
  signPreparedCalls: (params) => signPreparedCalls(client, params),
  sendPreparedCalls: (params) => sendPreparedCalls(client, params),
  sendCalls: (params) => sendCalls(client, params),
  // Note that status actions from Viem don't work since the chain ID is not hex.
  getCallsStatus: (params) => getCallsStatus(client, params),
  waitForCallsStatus: (params) => waitForCallsStatus(client, params),
});
