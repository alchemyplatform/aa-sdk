import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetNftsForCollectionParams,
  GetNftsForCollectionResult,
} from "../../types.js";

/**
 * Fetches all NFTs for a given collection (by contract address or collection slug). The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForCollectionParams} params Collection identifier, optional network override, and paging filters
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftsForCollectionResult>} The collection's NFTs and next-page token
 */
export async function getNftsForCollection(
  client: DataClient,
  params: GetNftsForCollectionParams,
  options?: RequestOptions,
): Promise<GetNftsForCollectionResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTsForCollection",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
