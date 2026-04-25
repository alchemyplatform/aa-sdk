import type { Prettify } from "viem";
import type {
  DistributiveOmit,
  InnerSolanaWalletApiClient,
} from "../../types.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";
import { prepareCalls, type SolanaPrepareCallsParams } from "./prepareCalls.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SolanaSendPreparedCallsResult,
} from "./sendPreparedCalls.js";
import { LOGGER } from "../../logger.js";

export type SolanaSendCallsParams = Prettify<
  DistributiveOmit<SolanaPrepareCallsParams, "chainId"> & {
    chainId?: SolanaChainId;
  }
>;

export type SolanaSendCallsResult = Prettify<SolanaSendPreparedCallsResult>;

/**
 * Prepares, signs, and submits Solana instructions in a single call.
 * Internally calls `prepareCalls`, `signPreparedCalls`, and `sendPreparedCalls`.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet API client
 * @param {SolanaSendCallsParams} params - Parameters for sending Solana calls
 * @param {Array<{programId: string, accounts?: Array, data: Hex}>} params.calls - Array of Solana instructions
 * @param {string} [params.account] - The Solana address to execute from. Defaults to the signer's address.
 * @param {object} [params.capabilities] - Optional capabilities (e.g. paymaster sponsorship)
 * @returns {Promise<SolanaSendCallsResult>} The result containing the call ID
 *
 * @example
 * ```ts
 * const result = await client.sendCalls({
 *   calls: [{
 *     programId: "11111111111111111111111111111111",
 *     data: "0x...",
 *   }],
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 * ```
 */
export async function sendCalls(
  client: InnerSolanaWalletApiClient,
  params: SolanaSendCallsParams,
): Promise<SolanaSendCallsResult> {
  LOGGER.info("sendCalls:start", {
    calls: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const { chainId, ...rest } = params;
  const prepared = await prepareCalls(client, {
    ...rest,
    ...(chainId != null ? { chainId } : {}),
  });

  const signed = await signPreparedCalls(client, prepared);
  const res = await sendPreparedCalls(client, signed);
  LOGGER.info("sendCalls:done");
  return res;
}
