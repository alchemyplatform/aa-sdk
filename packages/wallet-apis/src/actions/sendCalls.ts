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

export type SendCallsParams = Prettify<
  DistributiveOmit<PrepareCallsParams, "chainId"> & {
    chain?: Pick<Chain, "id">;
  }
>;

export type SendCallsResult = Prettify<SendPreparedCallsResult>;

export type SolanaSendCallsParams = Prettify<
  DistributiveOmit<SolanaPrepareCallsParams, "chainId"> & {
    chainId?: SolanaChainId;
  }
>;

export type SolanaSendCallsResult = Prettify<SolanaSendPreparedCallsResult>;

/**
 * Prepares, signs, and submits calls. This function internally calls `prepareCalls`, `signPreparedCalls`, and `sendPreparedCalls`.
 *
 * The client defaults to using EIP-7702 with the signer's address, so you can call
 * this directly without first calling `requestAccount`.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SendCallsParams} params - Parameters for sending calls
 * @param {Array<{to: Address, data?: Hex, value?: bigint}>} params.calls - Array of contract calls to execute
 * @param {AccountParam} [params.account] - The account to execute the calls from. Can be an address string or an object with an `address` property. Defaults to the client's account (signer address via EIP-7702).
 * @param {object} [params.capabilities] - Optional capabilities to include with the request.
 * @returns {Promise<SendPreparedCallsResult>} A Promise that resolves to the result containing the call ID.
 *
 * @example
 * ```ts
 * // Send calls (uses signer address via EIP-7702 by default)
 * const result = await client.sendCalls({
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
 * // The result contains the call ID
 * console.log(result.id);
 * ```
 */
export async function sendCalls(
  client: InnerWalletApiClient<"evm">,
  params: SendCallsParams,
): Promise<SendCallsResult>;
/**
 * Prepares, signs, and submits Solana instructions in a single call.
 * Internally calls `prepareCalls`, `signPreparedCalls`, and `sendPreparedCalls`.
 *
 * @param {InnerWalletApiClient<"solana">} client - The Solana wallet API client
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
  client: InnerWalletApiClient<"solana">,
  params: SolanaSendCallsParams,
): Promise<SolanaSendCallsResult>;
export async function sendCalls(
  client: InnerWalletApiClient<Mode>,
  params: SendCallsParams | SolanaSendCallsParams,
): Promise<SendCallsResult | SolanaSendCallsResult> {
  if ("solanaChainId" in client.chain) {
    return sendSolanaCalls(
      client as InnerWalletApiClient<"solana">,
      params as SolanaSendCallsParams,
    );
  }

  return sendEvmCalls(
    client as InnerWalletApiClient<"evm">,
    params as SendCallsParams,
  );
}

async function sendSolanaCalls(
  client: InnerWalletApiClient<"solana">,
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

async function sendEvmCalls(
  client: InnerWalletApiClient<"evm">,
  params: SendCallsParams,
): Promise<SendCallsResult> {
  LOGGER.info("sendCalls:start", {
    calls: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const { chain, ...prepareCallsParams } = params;

  let calls = await prepareCalls(client, {
    ...prepareCallsParams,
    ...(chain != null ? { chainId: chain.id } : {}),
  });

  if (calls.type === "paymaster-permit") {
    const signature = await signSignatureRequest(
      client,
      calls.signatureRequest,
    );

    const secondCallParams = {
      ...calls.modifiedRequest,
      paymasterPermitSignature: signature as Exclude<
        typeof signature,
        { type: "webauthn-p256" }
      >,
    };

    calls = await prepareCalls(client, secondCallParams);
  }

  const signedCalls = await signPreparedCalls(client, calls);

  const sendPreparedCallsCapabilities = extractCapabilitiesForSending(
    params.capabilities,
  );

  const res = await sendPreparedCalls(client, {
    ...signedCalls,
    ...(sendPreparedCallsCapabilities != null
      ? { capabilities: sendPreparedCallsCapabilities }
      : {}),
  });
  LOGGER.info("sendCalls:done");
  return res;
}
