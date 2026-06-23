import { resolveNetwork } from "@alchemy/common/core";
import { DATA_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { GetTokenBalancesByAddressBody } from "../../generated/rest/portfolio.schema.js";
import type { PortfolioRestSchema } from "../../schema/rest.js";
import type {
  GetTokenBalancesByAddressParams,
  GetTokenBalancesByAddressResult,
} from "../../types.js";

/**
 * Fetches token balances (without metadata or prices) for one or more
 * addresses across one or more networks in a single call.
 * This is a multi-network request against the global Data API: networks
 * travel in the request body, so the client's chain is not involved.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenBalancesByAddressParams} params Addresses paired with networks, plus options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetTokenBalancesByAddressResult>} Token balances per wallet/network pair
 */
export async function getTokenBalancesByAddress(
  client: DataClient,
  params: GetTokenBalancesByAddressParams,
  options?: RequestOptions,
): Promise<GetTokenBalancesByAddressResult> {
  const { addresses, ...rest } = params;
  const restClient = getRestClient<PortfolioRestSchema>(client, DATA_API_URL);
  return restClient.request({
    route: "assets/tokens/balances/by-address",
    method: "POST",
    // The cast widens the spec's network-slug enum: the SDK deliberately
    // accepts registry-unknown slugs as an escape hatch.
    body: {
      ...rest,
      addresses: addresses.map(({ networks, ...entry }) => ({
        ...entry,
        networks: networks.map((n) => resolveNetwork(n).slug),
      })),
    } as GetTokenBalancesByAddressBody,
    signal: options?.signal,
  });
}
