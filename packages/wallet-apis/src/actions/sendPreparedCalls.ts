import type { Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient, Mode } from "../types.ts";
import { PreparedCall_SolanaV0_Signed as PreparedCall_SolanaV0_SignedSchema } from "@alchemy/wallet-api-types";
import type { StaticDecode } from "typebox";
import { LOGGER } from "../logger.js";
import {
  mergeClientCapabilities,
  toRpcCapabilities,
  type WithCapabilities,
} from "../utils/capabilities.js";
import { wallet_sendPreparedCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import {
  methodSchema,
  encode,
  decode,
  type MethodParams,
  type MethodResponse,
} from "../utils/schema.js";

const schema = methodSchema(MethodSchema);
type BaseSendPreparedCallsParams = MethodParams<typeof MethodSchema>;
type SendPreparedCallsResponse = MethodResponse<typeof MethodSchema>;

type EvmBaseSendPreparedCallsParams = Exclude<
  BaseSendPreparedCallsParams,
  { type: "solana-transaction-v0" }
>;

export type SendPreparedCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<EvmBaseSendPreparedCallsParams, "chainId"> & {
      chainId?: number;
    }
  >
>;

type EvmSendPreparedCallsResponse = Extract<
  SendPreparedCallsResponse,
  { details: { type: "user-operation" | "delegation" } }
>;

export type SendPreparedCallsResult = EvmSendPreparedCallsResponse;

export type SolanaSendPreparedCallsParams = Prettify<
  StaticDecode<typeof PreparedCall_SolanaV0_SignedSchema>
>;

type SolanaSendPreparedCallsResponse = Extract<
  SendPreparedCallsResponse,
  { details: { type: "solana-transaction-v0" } }
>;

export type SolanaSendPreparedCallsResult = SolanaSendPreparedCallsResponse;

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
  client: InnerWalletApiClient<"evm">,
  params: SendPreparedCallsParams,
): Promise<SendPreparedCallsResult>;
/**
 * Sends a signed Solana transaction.
 * This method is used after signing the signature request returned from prepareCalls.
 *
 * @param {InnerWalletApiClient<"solana">} client - The Solana wallet API client
 * @param {SolanaSendPreparedCallsParams} params - The signed Solana transaction
 * @returns {Promise<SolanaSendPreparedCallsResult>} The result containing the call ID
 */
export async function sendPreparedCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaSendPreparedCallsParams,
): Promise<SolanaSendPreparedCallsResult>;
export async function sendPreparedCalls(
  client: InnerWalletApiClient<Mode>,
  params: SendPreparedCallsParams | SolanaSendPreparedCallsParams,
): Promise<SendPreparedCallsResult | SolanaSendPreparedCallsResult> {
  if ("solanaChainId" in client.chain) {
    return sendSolanaPreparedCalls(
      client as InnerWalletApiClient<"solana">,
      params as SolanaSendPreparedCallsParams,
    );
  }

  return sendEvmPreparedCalls(
    client as InnerWalletApiClient,
    params as SendPreparedCallsParams,
  );
}

async function sendSolanaPreparedCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaSendPreparedCallsParams,
): Promise<SolanaSendPreparedCallsResult> {
  LOGGER.debug("sendPreparedCalls:start", { type: params.type });

  const rpcParams = encode(schema.request, params);
  const rpcResp = await (client as unknown as InnerWalletApiClient).request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });

  LOGGER.debug("sendPreparedCalls:done");
  return decode(schema.response, rpcResp) as SolanaSendPreparedCallsResult;
}

async function sendEvmPreparedCalls(
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

  const rpcParams = encode(schema.request, fullParams);

  const rpcResp = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });

  LOGGER.debug("sendPreparedCalls:done");
  return decode(schema.response, rpcResp) as SendPreparedCallsResult;
}
