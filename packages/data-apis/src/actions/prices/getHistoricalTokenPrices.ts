import { resolveNetwork } from "@alchemy/common";
import { PRICES_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { GetHistoricalTokenPricesBody } from "../../generated/rest/prices.schema.js";
import type { PricesRestSchema } from "../../schema/rest.js";
import type {
  GetHistoricalTokenPricesParams,
  GetHistoricalTokenPricesResult,
} from "../../types.js";

/**
 * Fetches historical prices for a token, identified either by symbol
 * (chain-agnostic) or by network + contract address. Runs against the global
 * Prices API; when a network is given it travels in the request body, so the
 * client's chain is not involved.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetHistoricalTokenPricesParams} params Token identifier, time range, and interval
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetHistoricalTokenPricesResult>} The price series
 */
export async function getHistoricalTokenPrices(
  client: DataClient,
  params: GetHistoricalTokenPricesParams,
  options?: RequestOptions,
): Promise<GetHistoricalTokenPricesResult> {
  const body = (
    "network" in params && params.network != null
      ? { ...params, network: resolveNetwork(params.network).slug }
      : params
  ) as GetHistoricalTokenPricesBody;

  const restClient = getRestClient<PricesRestSchema>(client, PRICES_API_URL);
  return restClient.request({
    route: "tokens/historical",
    method: "POST",
    body,
    signal: options?.signal,
  });
}
