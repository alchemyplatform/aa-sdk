import { toHex, type Prettify } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient, OptionalChainId } from "../types.ts";
import { LOGGER } from "../logger.js";
import { mergeClientCapabilities } from "../utils/capabilities.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_sendPreparedCalls";
    };
  }
>;

export type SendPreparedCallsParams = Prettify<
  OptionalChainId<RpcSchema["Request"]["params"][0]>
>;

export type SendPreparedCallsResult = Prettify<{
  id: `0x${string}`;
}>;

/**
 * Sends prepared calls by submitting a signed user operation.
 * This method is used after signing the signature request returned from prepareCalls.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SendPreparedCallsParams} params - Parameters for sending prepared calls
 * @returns {Promise<SendPreparedCallsResult>} A Promise that resolves to the result containing the call ID
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
  params.capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("sendPreparedCalls:start", { type: params.type });
  const res = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [
      params.type === "array"
        ? params
        : {
            ...params,
            chainId: params.chainId ?? toHex(client.chain.id),
          },
    ],
  });
  LOGGER.debug("sendPreparedCalls:done");
  // The RPC types package still uses the old `preparedCallIds` shape;
  // the API now returns `{ id }` instead.
  return res as unknown as SendPreparedCallsResult;
}
