import type { Address, Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { prepareCalls, type PrepareCallsParams } from "./prepareCalls.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
} from "./sendPreparedCalls.js";

export type SendCallsParams<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<PrepareCallsParams<TAccount>>;

export type SendCallsResult = Prettify<SendPreparedCallsResult>;

/**
 * Prepares, signs, and submits calls. This function internally calls `prepareCalls`, `signPreparedCalls`, and `sendPreparedCalls`.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareCallsParams<TAccount>} params - Parameters for sending calls
 * @param {Array<{to: Address, data?: Hex, value?: Hex}>} params.calls - Array of contract calls to execute
 * @param {Address} [params.from] - The address to execute the calls from (required if the client wasn't initialized with an account)
 * @param {object} [params.capabilities] - Optional capabilities to include with the request.
 * @returns {Promise<SendPreparedCallsResult>} A Promise that resolves to the result containing the prepared call IDs.
 *
 *  @example
 * ```ts
 * const result = await client.sendCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: "0x0"
 *   }],
 *   capabilities: {
 *     paymasterService: { policyId: "your-policy-id" }
 *   }
 * });
 *
 * // The result contains the prepared call IDs
 * console.log(result.preparedCallIds);
 * ```
 */
export async function sendCalls<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: SendCallsParams<TAccount>,
): Promise<SendCallsResult> {
  const calls = await prepareCalls(client, params);

  const signedCalls = await signPreparedCalls(client, calls);

  return await sendPreparedCalls(client, {
    ...signedCalls,
    // The only capability that is supported in sendPreparedCalls is permissions.
    ...(params.capabilities?.permissions != null
      ? { capabilities: { permissions: params.capabilities.permissions } }
      : {}),
  });
}
