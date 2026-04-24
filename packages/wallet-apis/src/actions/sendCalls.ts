import type { Chain, Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient, Mode } from "../types.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";
import {
  prepareCalls,
  type PrepareCallsParams,
  type SolanaPrepareCallsParams,
} from "./prepareCalls.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
  type SolanaSendPreparedCallsResult,
} from "./sendPreparedCalls.js";
import { LOGGER } from "../logger.js";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { extractCapabilitiesForSending } from "../utils/capabilities.js";

// ── EVM types ────────────────────────────────────────────────────────────────

export type SendCallsParams = Prettify<
  DistributiveOmit<PrepareCallsParams, "chainId"> & {
    chain?: Pick<Chain, "id">;
  }
>;

export type SendCallsResult = Prettify<SendPreparedCallsResult>;

// ── Solana types ─────────────────────────────────────────────────────────────

export type SolanaSendCallsParams = Prettify<
  DistributiveOmit<SolanaPrepareCallsParams, "chainId"> & {
    chainId?: SolanaChainId;
  }
>;

export type SolanaSendCallsResult = Prettify<SolanaSendPreparedCallsResult>;

// ── Overloads ────────────────────────────────────────────────────────────────

export async function sendCalls(
  client: InnerWalletApiClient<"evm">,
  params: SendCallsParams,
): Promise<SendCallsResult>;
export async function sendCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaSendCallsParams,
): Promise<SolanaSendCallsResult>;
export async function sendCalls(
  client: InnerWalletApiClient<Mode>,
  params: SendCallsParams | SolanaSendCallsParams,
): Promise<SendCallsResult | SolanaSendCallsResult> {
  LOGGER.info("sendCalls:start", {
    calls: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const isSolana = "solanaChainId" in client.chain;

  // ── Solana path ──────────────────────────────────────────────────────────
  if (isSolana) {
    const solClient = client as InnerWalletApiClient<"solana">;
    const solParams = params as SolanaSendCallsParams;
    const { chainId, ...rest } = solParams;

    const prepared = await prepareCalls(solClient, {
      ...rest,
      ...(chainId != null ? { chainId } : {}),
    });

    const signed = await signPreparedCalls(solClient, prepared);
    const res = await sendPreparedCalls(solClient, signed);
    LOGGER.info("sendCalls:done");
    return res;
  }

  // ── EVM path ─────────────────────────────────────────────────────────────
  const evmClient = client as InnerWalletApiClient<"evm">;
  const evmParams = params as SendCallsParams;
  const { chain, ...prepareCallsParams } = evmParams;

  let calls = await prepareCalls(evmClient, {
    ...prepareCallsParams,
    ...(chain != null ? { chainId: chain.id } : {}),
  });

  if (calls.type === "paymaster-permit") {
    const signature = await signSignatureRequest(
      evmClient,
      calls.signatureRequest,
    );

    const secondCallParams = {
      ...calls.modifiedRequest,
      paymasterPermitSignature: signature as Exclude<
        typeof signature,
        { type: "webauthn-p256" }
      >,
    };

    calls = await prepareCalls(evmClient, secondCallParams);
  }

  const signedCalls = await signPreparedCalls(evmClient, calls);

  const sendPreparedCallsCapabilities = extractCapabilitiesForSending(
    evmParams.capabilities,
  );

  const res = await sendPreparedCalls(evmClient, {
    ...signedCalls,
    ...(sendPreparedCallsCapabilities != null
      ? { capabilities: sendPreparedCallsCapabilities }
      : {}),
  });
  LOGGER.info("sendCalls:done");
  return res;
}
