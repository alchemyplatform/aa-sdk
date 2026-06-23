import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetCollectionMetadataParams,
  GetCollectionMetadataResult,
} from "../../types.js";

/**
 * Fetches metadata for an NFT collection by slug. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetCollectionMetadataParams} params Collection slug and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetCollectionMetadataResult>} The collection's metadata
 */
export async function getCollectionMetadata(
  client: DataClient,
  params: GetCollectionMetadataParams,
  options?: RequestOptions,
): Promise<GetCollectionMetadataResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getCollectionMetadata",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
