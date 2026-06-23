import { resolveNetwork } from "@alchemy/common/core";
import { DATA_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { PortfolioRestSchema } from "../../schema/rest.js";
import type {
  GetTokensByAddressParams,
  GetTokensByAddressResult,
} from "../../types.js";

/**
 * Fetches tokens (with optional metadata and prices) for one or more addresses
 * across one or more networks in a single call. This is a multi-network
 * request against the global Data API: networks travel in the request body,
 * so the client's chain is not involved.
 *
 * @example
 * ```ts
 * const tokens = await getTokensByAddress(client, {
 *   addresses: [
 *     {
 *       address: "0x...",
 *       networks: ["eth-mainnet", "base-mainnet", "solana-mainnet"],
 *     },
 *   ],
 * });
 * ```
 *
 * @param {DataClient} client A Data API client
 * @param {GetTokensByAddressParams} params Addresses paired with networks, plus options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetTokensByAddressResult>} Token balances, metadata, and prices
 */
export async function getTokensByAddress(
  client: DataClient,
  params: GetTokensByAddressParams,
  options?: RequestOptions,
): Promise<GetTokensByAddressResult> {
  const { addresses, ...rest } = params;
  const restClient = getRestClient<PortfolioRestSchema>(client, DATA_API_URL);
  return restClient.request({
    route: "assets/tokens/by-address",
    method: "POST",
    body: {
      ...rest,
      addresses: addresses.map(({ address, networks }) => ({
        address,
        networks: networks.map((n) => resolveNetwork(n).slug),
      })),
    },
    signal: options?.signal,
  });
}
