import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type { ComputeRarityParams, ComputeRarityResult } from "../../types.js";

/**
 * Computes attribute rarity for a specific NFT. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {ComputeRarityParams} params Contract address, token id, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<ComputeRarityResult>} Rarity scores per attribute
 */
export async function computeRarity(
  client: DataClient,
  params: ComputeRarityParams,
  options?: RequestOptions,
): Promise<ComputeRarityResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "computeRarity",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
