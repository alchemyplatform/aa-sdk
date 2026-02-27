import type { Chain, Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.js";
import { prepareCalls, type PrepareCallsParams } from "./prepareCalls.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
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
 *  @example
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
 * <Note>
 * If using this action with an ERC-20 paymaster in pre-operation mode with `autoPermit`, the contents of the permit will be hidden
 * from the user. It is recommended to use the `prepareCalls` action instead to manually handle the permit signature.
 * </Note>
 */
export async function sendCalls(
  client: InnerWalletApiClient,
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
      // WebAuthn signatures are not supported for paymaster permits (throws above).
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
