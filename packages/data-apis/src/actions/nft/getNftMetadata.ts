import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetNftMetadataParams,
  GetNftMetadataResult,
} from "../../types.js";

/**
 * Fetches metadata for a single NFT. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftMetadataParams} params Contract address, token id, optional network override, and cache options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftMetadataResult>} The NFT's metadata
 */
export async function getNftMetadata(
  client: DataClient,
  params: GetNftMetadataParams,
  options?: RequestOptions,
): Promise<GetNftMetadataResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTMetadata",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
