import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  SearchContractMetadataParams,
  SearchContractMetadataResult,
} from "../../types.js";

/**
 * Searches NFT contract metadata by keyword. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {SearchContractMetadataParams} params Search query and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<SearchContractMetadataResult>} The matching contracts
 */
export async function searchContractMetadata(
  client: DataClient,
  params: SearchContractMetadataParams,
  options?: RequestOptions,
): Promise<SearchContractMetadataResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "searchContractMetadata",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
