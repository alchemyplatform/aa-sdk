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

// ── EVM types ────────────────────────────────────────────────────────────────

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

// ── Solana types ─────────────────────────────────────────────────────────────

export type SolanaSendPreparedCallsParams = Prettify<
  StaticDecode<typeof PreparedCall_SolanaV0_SignedSchema>
>;

type SolanaSendPreparedCallsResponse = Extract<
  SendPreparedCallsResponse,
  { details: { type: "solana-transaction-v0" } }
>;

export type SolanaSendPreparedCallsResult = SolanaSendPreparedCallsResponse;

// ── Overloads ────────────────────────────────────────────────────────────────

export async function sendPreparedCalls(
  client: InnerWalletApiClient<"evm">,
  params: SendPreparedCallsParams,
): Promise<SendPreparedCallsResult>;
export async function sendPreparedCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaSendPreparedCallsParams,
): Promise<SolanaSendPreparedCallsResult>;
export async function sendPreparedCalls(
  client: InnerWalletApiClient<Mode>,
  params: SendPreparedCallsParams | SolanaSendPreparedCallsParams,
): Promise<SendPreparedCallsResult | SolanaSendPreparedCallsResult> {
  const isSolana = "solanaChainId" in client.chain;

  LOGGER.debug("sendPreparedCalls:start", {
    type: (params as SendPreparedCallsParams).type,
  });

  if (isSolana) {
    const rpcParams = encode(
      schema.request,
      params as SolanaSendPreparedCallsParams,
    );
    const rpcResp = await (client as InnerWalletApiClient).request({
      method: "wallet_sendPreparedCalls",
      params: [rpcParams],
    });
    LOGGER.debug("sendPreparedCalls:done");
    return decode(schema.response, rpcResp) as SolanaSendPreparedCallsResult;
  }

  const evmClient = client as InnerWalletApiClient;
  const evmParams = params as SendPreparedCallsParams;
  const capabilities = mergeClientCapabilities(
    evmClient,
    evmParams.capabilities,
  );

  const { chainId: rawChainId, ...restParams } = evmParams;
  const chainId = rawChainId ?? evmClient.chain.id;

  const fullParams =
    restParams.type === "array"
      ? { ...restParams, capabilities: toRpcCapabilities(capabilities) }
      : {
          ...restParams,
          chainId,
          capabilities: toRpcCapabilities(capabilities),
        };

  const rpcParams = encode(schema.request, fullParams);

  const rpcResp = await evmClient.request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });

  LOGGER.debug("sendPreparedCalls:done");
  return decode(schema.response, rpcResp) as SendPreparedCallsResult;
}
