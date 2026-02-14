import type { Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { LOGGER } from "../logger.js";
import {
  mergeClientCapabilities,
  toRpcCapabilities,
  type WithCapabilities,
} from "../utils/capabilities.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import { wallet_prepareCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { Value } from "typebox/value";
import {
  methodSchema,
  type MethodParams,
  type MethodResponse,
} from "../utils/schema.js";

const schema = methodSchema(MethodSchema);
type BasePrepareCallsParams = MethodParams<typeof MethodSchema>;
type PrepareCallsResponse = MethodResponse<typeof MethodSchema>;

export type PrepareCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<BasePrepareCallsParams, "from" | "chainId"> & {
      account?: AccountParam;
      chainId?: number;
    }
  >
>;

export type PrepareCallsResult = PrepareCallsResponse;

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
 * @param {Array<{to: Address, data?: Hex, value?: bigint}>} params.calls - Array of contract calls to execute
 * @param {AccountParam} [params.account] - The account to execute the calls from. Can be an address string or an object with an `address` property. Defaults to the client's account (signer address via EIP-7702).
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
 *     value: 0n
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
  const from = params.account
    ? resolveAddress(params.account)
    : client.account.address;

  const chainId = params.chainId ?? client.chain.id;

  const capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const { account: _, chainId: __, ...rest } = params;
  const rpcParams = Value.Encode(schema.request, {
    ...rest,
    chainId,
    from,
    capabilities: toRpcCapabilities(capabilities),
  } satisfies BasePrepareCallsParams);

  const rpcResp = await client.request({
    method: "wallet_prepareCalls",
    params: [rpcParams],
  });

  LOGGER.debug("prepareCalls:done");
  return Value.Decode(schema.response, rpcResp);
}
