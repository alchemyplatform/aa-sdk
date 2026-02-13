import type { Address } from "viem";
import type { InnerWalletApiClient } from "../../types.js";
import { prepareCalls, type PrepareCallsParams } from "./prepareCalls.js";
import { metrics } from "../../metrics.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
} from "./sendPreparedCalls.js";
import { signSignatureRequest } from "./signSignatureRequest.js";
import type { SmartWalletSigner } from "../index.js";
import { extractCapabilitiesForSending } from "../../internal/capabilities.js";

export type SendCallsParams<
  TAccount extends Address | undefined = Address | undefined,
> = PrepareCallsParams<TAccount>;

export type SendCallsResult = SendPreparedCallsResult;

/**
 * Prepares, signs, and submits calls. This function internally calls `prepareCalls`, `signPreparedCalls`, and `sendPreparedCalls`.
 *
 * <Note>
 * If using this action with an ERC-20 paymaster in pre-operation mode with `autoPermit`, the contents of the permit will be hidden
 * from the user. It is recommended to use the `prepareCalls` action instead to manually handle the permit signature.
 * </Note>
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SmartAccountSigner} signer - The signer to use
 * @param {PrepareCallsParams<TAccount>} params - Parameters for sending calls
 * @param {Array<{to: Address, data?: Hex, value?: Hex}>} params.calls - Array of contract calls to execute
 * @param {Address} [params.from] - The address to execute the calls from (required if the client wasn't initialized with an account)
 * @param {object} [params.capabilities] - Optional capabilities to include with the request. See [API documentation](/wallets/api-reference/smart-wallets/wallet-api-endpoints/wallet-api-endpoints/wallet-prepare-calls#request.body.prepareCallsRequest.capabilities) for details.
 * @returns {Promise<SendPreparedCallsResult>} A Promise that resolves to the result containing the call ID.
 *
 *  @example
 * ```ts
 * const result = await client.sendCalls({
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
 * // The result contains the call ID
 * console.log(result.id);
 * ```
 */
export async function sendCalls<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  signer: SmartWalletSigner,
  params: SendCallsParams<TAccount>,
): Promise<SendCallsResult> {
  metrics.trackEvent({
    name: "send_calls",
  });

  let calls = await prepareCalls(client, params);

  if (calls.type === "paymaster-permit") {
    const signature = await signSignatureRequest(
      signer,
      calls.signatureRequest,
    );

    const secondCallParams = {
      from: calls.modifiedRequest.from,
      calls: calls.modifiedRequest.calls,
      capabilities: calls.modifiedRequest.capabilities,
      paymasterPermitSignature: signature,
    };

    calls = await prepareCalls(client, secondCallParams);
  }

  const signedCalls = await signPreparedCalls(signer, calls);

  const capabilities = extractCapabilitiesForSending(params.capabilities);

  return await sendPreparedCalls(client, {
    ...signedCalls,
    ...(capabilities != null ? { capabilities } : {}),
  });
}
