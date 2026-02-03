import { type Address, type Hex, type Prettify } from "viem";
import type {
  InnerWalletApiClient,
  SignedPreparedCalls,
  SendPreparedCallsCapabilities,
} from "../types.ts";
import { LOGGER } from "../logger.js";
import { mergeClientCapabilities } from "../utils/capabilities.js";
import { fromRpcSendPreparedCallsResult } from "../utils/viemEncode.js";
import { toRpcSendPreparedCallsParams } from "../utils/viemDecode.js";

export type SendPreparedCallsParams = Prettify<
  SignedPreparedCalls & {
    capabilities?: SendPreparedCallsCapabilities;
  }
>;

export type SendPreparedCallsResult = Prettify<{
  id: Hex;
  preparedCallIds: Hex[];
  details:
    | {
        type: "user-operations";
        data: Array<{
          callId: Hex;
          hash: Hex;
          calls?: Array<{ to: Address; data?: Hex; value?: bigint }>;
        }>;
      }
    | {
        type: "user-operation";
        data: {
          hash: Hex;
          calls?: Array<{ to: Address; data?: Hex; value?: bigint }>;
        };
      };
}>;

/**
 * Sends prepared calls by submitting a signed user operation.
 * This method is used after signing the signature request returned from prepareCalls.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SendPreparedCallsParams} params - Parameters for sending prepared calls
 * @returns {Promise<SendPreparedCallsResult>} A Promise that resolves to the result containing the prepared call IDs
 *
 * @example
 * ```ts
 * // First prepare the calls
 * const preparedCalls = await client.prepareCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: 0n
 *   }],
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 *
 * // Then sign the calls
 * const signedCalls = await client.signPreparedCalls(preparedCalls);
 *
 * // Then send the prepared calls with the signature
 * const result = await client.sendPreparedCalls(signedCalls);
 * ```
 */
export async function sendPreparedCalls(
  client: InnerWalletApiClient,
  params: SendPreparedCallsParams,
): Promise<SendPreparedCallsResult> {
  const mergedCapabilities = mergeClientCapabilities(
    client,
    params.capabilities,
  );

  LOGGER.debug("sendPreparedCalls:start", { type: params.type });

  const rpcParams = toRpcSendPreparedCallsParams(
    { ...params, capabilities: mergedCapabilities },
    client.chain.id,
  );

  const res = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });
  LOGGER.debug("sendPreparedCalls:done");

  return fromRpcSendPreparedCallsResult(res);
}
