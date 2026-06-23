import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import { bracketArrayKeys } from "../../internal/query.js";
import type { GetCollectionsForOwnerQuery } from "../../generated/rest/nft.schema.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetCollectionsForOwnerParams,
  GetCollectionsForOwnerResult,
} from "../../types.js";

/**
 * Fetches all NFT collections an address holds tokens from. The network is
 * resolved per request: an explicit `network` param wins, otherwise the
 * client's configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetCollectionsForOwnerParams} params Owner address, optional network override, and filters
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetCollectionsForOwnerResult>} The owned collections and pagination cursor
 */
export async function getCollectionsForOwner(
  client: DataClient,
  params: GetCollectionsForOwnerParams,
  options?: RequestOptions,
): Promise<GetCollectionsForOwnerResult> {
  const { network, ...rest } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getCollectionsForOwner",
    method: "GET",
    query: bracketArrayKeys(rest, [
      "excludeFilters",
      "includeFilters",
    ]) as GetCollectionsForOwnerQuery,
    signal: options?.signal,
  });
}
