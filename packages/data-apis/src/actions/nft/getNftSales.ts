import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type { GetNftSalesParams, GetNftSalesResult } from "../../types.js";

/**
 * Fetches NFT sales matching the given filters. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftSalesParams} params Sale filters, optional network override, and paging options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftSalesResult>} The matching sales and pagination cursor
 */
export async function getNftSales(
  client: DataClient,
  params: GetNftSalesParams,
  options?: RequestOptions,
): Promise<GetNftSalesResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTSales",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
