import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetNftMetadataBatchParams,
  GetNftMetadataBatchResult,
} from "../../types.js";

/**
 * Fetches metadata for up to 100 NFTs in one call. The network is resolved
 * per request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftMetadataBatchParams} params The tokens to look up, cache options, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftMetadataBatchResult>} Metadata for each requested NFT
 */
export async function getNftMetadataBatch(
  client: DataClient,
  params: GetNftMetadataBatchParams,
  options?: RequestOptions,
): Promise<GetNftMetadataBatchResult> {
  const { network, ...body } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTMetadataBatch",
    method: "POST",
    body,
    signal: options?.signal,
  });
}
