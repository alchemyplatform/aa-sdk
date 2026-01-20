import { toHex } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient, WithoutChainId } from "../../types.ts";
import { metrics } from "../../metrics.js";
import { mergeClientCapabilities } from "../../internal/capabilities.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_sendPreparedCalls";
    };
  }
>;

export type SendPreparedCallsParams = WithoutChainId<
  RpcSchema["Request"]["params"][0]
>;

export type SendPreparedCallsResult = RpcSchema["ReturnType"];

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

  params.capabilities = mergeClientCapabilities(client, params.capabilities, {
    // `wallet_prepareCalls` accepts multiple policy ids, but this is only supported for
    // traditional "sponsorship" policy types. Since `wallet_sendPreparedCalls` only
    // requires a policy id for BSOs, we always use a single policy here.
    useSinglePolicyId: true,
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
