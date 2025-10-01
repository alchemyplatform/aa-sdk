import type { Static } from "@sinclair/typebox";
import { toHex } from "viem";
import type { wallet_sendPreparedCalls } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient, WithoutChainId } from "../../types.ts";
import { metrics } from "../../metrics.js";

export type SendPreparedCallsParams = WithoutChainId<
  Static<
    (typeof wallet_sendPreparedCalls)["properties"]["Request"]["properties"]["params"]
  >[0]
>;

export type SendPreparedCallsResult = Static<
  typeof wallet_sendPreparedCalls
>["ReturnType"];

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
 *     value: "0x0"
 *   }],
 *   capabilities: {
 *     paymasterService: { policyId: "your-policy-id" }
 *   }
 * });
 *
 * // Then sign the calls
 * const signedCalls = await client.signPreparedCalls(preparedCalls);
 *
 * // Then send the prepared calls with the signature
 * const result = await client.sendPreparedCalls({
 *   signedCalls,
 * });
 * ```
 */
export async function sendPreparedCalls(
  client: InnerWalletApiClient,
  params: SendPreparedCallsParams,
): Promise<SendPreparedCallsResult> {
  metrics.trackEvent({
    name: "send_prepared_calls",
    data: {
      type: params.type,
    },
  });

  return client.request({
    method: "wallet_sendPreparedCalls",
    params: [
      params.type === "array"
        ? params
        : {
            ...params,
            chainId: toHex(client.chain.id),
          },
    ],
  });
}
