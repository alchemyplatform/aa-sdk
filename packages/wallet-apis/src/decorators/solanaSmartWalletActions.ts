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
  waitForCallsStatus,
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
} from "viem/actions";

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
    params: GetCallsStatusParameters,
  ) => Promise<GetCallsStatusReturnType>;
  waitForCallsStatus: (
    params: WaitForCallsStatusParameters,
  ) => Promise<WaitForCallsStatusReturnType>;
};

export const solanaSmartWalletActions = (
  client: InnerSolanaWalletApiClient,
): SolanaSmartWalletActions => ({
  // Alchemy actions.
  prepareCalls: (params) => prepareCalls(client, params),
  signPreparedCalls: (params) => signPreparedCalls(client, params),
  sendPreparedCalls: (params) => sendPreparedCalls(client, params),
  sendCalls: (params) => sendCalls(client, params),
  // TODO(jh): be sure these work!
  // Viem actions.
  getCallsStatus: (params) => getCallsStatus(client, params),
  waitForCallsStatus: (params) => waitForCallsStatus(client, params),
});
