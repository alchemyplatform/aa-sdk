import { PRICES_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { PricesRestSchema } from "../../schema/rest.js";
import type {
  GetTokenPricesBySymbolParams,
  GetTokenPricesBySymbolResult,
} from "../../types.js";

/**
 * Fetches current prices for tokens by symbol (max 25). This is a
 * chain-agnostic request against the global Prices API — no network is
 * involved at all.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenPricesBySymbolParams} params The token symbols to price
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetTokenPricesBySymbolResult>} Prices per symbol
 */
export async function getTokenPricesBySymbol(
  client: DataClient,
  params: GetTokenPricesBySymbolParams,
  options?: RequestOptions,
): Promise<GetTokenPricesBySymbolResult> {
  const restClient = getRestClient<PricesRestSchema>(client, PRICES_API_URL);
  return restClient.request({
    route: "tokens/by-symbol",
    method: "GET",
    query: params,
    signal: options?.signal,
  });
}
