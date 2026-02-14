import { getCapabilities as viemGetCapabilities } from "viem/actions";
import type { InnerWalletApiClient } from "../types.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";

export type GetCapabilitiesParams = {
  account?: AccountParam;
  chainId?: number;
};

export type GetCapabilitiesResult = Record<string, unknown>;

/**
 * Gets the capabilities supported by the wallet for the given account.
 * Delegates to viem's `getCapabilities` and renames `paymasterService`
 * to `paymaster` for consistency with the SDK's public API.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {GetCapabilitiesParams} [params] - Optional parameters
 * @param {AccountParam} [params.account] - The account to query capabilities for. Can be an address string or an object with an `address` property. Defaults to the client's account.
 * @param {number} [params.chainId] - Optional chain ID to filter capabilities for. Defaults to the client's chain ID.
 * @returns {Promise<GetCapabilitiesResult>} The capabilities for the given chain
 *
 * @example
 * ```ts
 * const capabilities = await client.getCapabilities({
 *   account: "0x1234...",
 * });
 * // { paymaster: { supported: true }, atomic: { status: "supported" } }
 * ```
 */
export async function getCapabilities(
  client: InnerWalletApiClient,
  params?: GetCapabilitiesParams,
): Promise<GetCapabilitiesResult> {
  const account = params?.account
    ? resolveAddress(params.account)
    : client.account.address;

  const chainId = params?.chainId ?? client.chain.id;

  // Don't pass chainId to viem — the Alchemy API keys capabilities by a
  // generic identifier (0) rather than the actual chain ID, so viem's
  // chainId-based lookup would return undefined.
  const viemResult = await viemGetCapabilities(client, { account });

  // Look for capabilities matching the requested chainId, falling back to
  // the generic "0" key that the Alchemy API uses.
  const chainCaps = viemResult[chainId] ?? viemResult[0];

  if (!chainCaps) return {};

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(chainCaps)) {
    // Our paymaster capability interface is non-standard, so we rename it
    // from `paymasterService` to `paymaster` when used in our SDK client.
    if (key === "paymasterService") {
      result["paymaster"] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}
