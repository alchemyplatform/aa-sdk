import { resolveNetwork } from "@alchemy/common";
import { PRICES_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { PricesRestSchema } from "../../schema/rest.js";
import type {
  GetTokenPricesByAddressParams,
  GetTokenPricesByAddressResult,
} from "../../types.js";

/**
 * Fetches current prices for tokens by contract address (max 25 pairs). This
 * is a multi-network request against the global Prices API: each entry pairs
 * an address with its network, so the client's chain is not involved.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenPricesByAddressParams} params Address/network pairs to price
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetTokenPricesByAddressResult>} Prices per address/network pair
 */
export async function getTokenPricesByAddress(
  client: DataClient,
  params: GetTokenPricesByAddressParams,
  options?: RequestOptions,
): Promise<GetTokenPricesByAddressResult> {
  const restClient = getRestClient<PricesRestSchema>(client, PRICES_API_URL);
  return restClient.request({
    route: "tokens/by-address",
    method: "POST",
    body: {
      addresses: params.addresses.map(({ address, network }) => ({
        address,
        network: resolveNetwork(network).slug,
      })),
    },
    signal: options?.signal,
  });
}
