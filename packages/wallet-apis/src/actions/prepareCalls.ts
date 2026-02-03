import type { Address, Hex, Prettify } from "viem";
import type {
  InnerWalletApiClient,
  Call,
  PrepareCallsCapabilities,
} from "../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import { mergeClientCapabilities } from "../utils/capabilities.js";
import { toRpcPrepareCallsParams } from "../utils/viemDecode.js";
import {
  fromRpcPrepareCallsResult,
  type PrepareCallsResult,
} from "../utils/viemEncode.js";

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export type PrepareCallsParams = Prettify<{
  calls: Call[];
  from?: Address;
  chainId?: number;
  capabilities?: PrepareCallsCapabilities;
  paymasterPermitSignature?: {
    type: "secp256k1" | "ecdsa";
    data: Hex;
  };
}>;

// Export the viem-native result type
export type { PrepareCallsResult };

/**
 * Prepares a set of contract calls for execution by building a user operation.
 * Returns the built user operation and a signature request that needs to be signed
 * before submitting to sendPreparedCalls.
 *
 * The client defaults to using EIP-7702 with the signer's address, so you can call
 * this directly without first calling `requestAccount`.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareCallsParams} params - Parameters for preparing calls
 * @param {Array<{to: Address, data?: Hex, value?: Hex}>} params.calls - Array of contract calls to execute
 * @param {Address} [params.from] - The address to execute the calls from. Defaults to the client's account (signer address via EIP-7702).
 * @param {object} [params.capabilities] - Optional capabilities to include with the request
 * @returns {Promise<PrepareCallsResult>} A Promise that resolves to the prepared calls result containing
 * the user operation data and signature request
 *
 * @example
 * ```ts
 * // Prepare a sponsored user operation call (uses signer address via EIP-7702 by default)
 * const result = await client.prepareCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: "0x0"
 *   }],
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 * ```
 */
export async function prepareCalls(
  client: InnerWalletApiClient,
  params: PrepareCallsParams,
): Promise<PrepareCallsResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    LOGGER.warn("prepareCalls:no-from", { hasClientAccount: !!client.account });
    throw new AccountNotFoundError();
  }

  const capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  // Convert viem-native params to RPC format
  const rpcParams = toRpcPrepareCallsParams(
    {
      ...params,
      capabilities,
    },
    client.chain.id,
    from,
  );

  const res = await client.request({
    method: "wallet_prepareCalls",
    params: [rpcParams],
  });

  LOGGER.debug("prepareCalls:done");

  // Convert RPC result to viem-native format
  return fromRpcPrepareCallsResult(res);
}
