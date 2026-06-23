import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type { GetFloorPriceParams, GetFloorPriceResult } from "../../types.js";

/**
 * Fetches marketplace floor prices for an NFT contract or collection. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetFloorPriceParams} params Contract address or collection slug, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetFloorPriceResult>} Floor prices per marketplace
 */
export async function getFloorPrice(
  client: DataClient,
  params: GetFloorPriceParams,
  options?: RequestOptions,
): Promise<GetFloorPriceResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getFloorPrice",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
