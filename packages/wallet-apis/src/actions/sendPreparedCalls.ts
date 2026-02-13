import type { Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { LOGGER } from "../logger.js";
import {
  mergeClientCapabilities,
  toRpcCapabilities,
  type WithCapabilities,
} from "../utils/capabilities.js";
import { wallet_sendPreparedCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";

const schema = {
  request: MethodSchema.properties.Request.properties.params.items[0],
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type BaseSendPreparedCallsParams = Schema["Request"]["params"][0];
type SendPreparedCallsResponse = Schema["ReturnType"];

export type SendPreparedCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<BaseSendPreparedCallsParams, "chainId"> & {
      chainId?: number;
    }
  >
>;

export type SendPreparedCallsResult = SendPreparedCallsResponse;

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
 * const result = await client.sendPreparedCalls({
 *   signedCalls,
 * });
 * ```
 */
export async function sendPreparedCalls(
  client: InnerWalletApiClient,
  params: SendPreparedCallsParams,
): Promise<SendPreparedCallsResult> {
  const capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("sendPreparedCalls:start", { type: params.type });

  const { chainId: rawChainId, ...restParams } = params;
  const chainId = rawChainId ?? client.chain.id;

  const fullParams =
    restParams.type === "array"
      ? { ...restParams, capabilities: toRpcCapabilities(capabilities) }
      : {
          ...restParams,
          chainId,
          capabilities: toRpcCapabilities(capabilities),
        };

  const rpcParams = Value.Encode(
    schema.request,
    fullParams satisfies BaseSendPreparedCallsParams,
  );

  const rpcResp = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });

  LOGGER.debug("sendPreparedCalls:done");
  return Value.Decode(schema.response, rpcResp);
}
