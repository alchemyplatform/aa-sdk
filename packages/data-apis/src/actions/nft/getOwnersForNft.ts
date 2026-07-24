import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetOwnersForNftParams,
  GetOwnersForNftResult,
} from "../../types.js";

/**
 * Fetches the owners of a specific NFT. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetOwnersForNftParams} params Contract address, token id, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetOwnersForNftResult>} The NFT's owners
 */
export async function getOwnersForNft(
  client: DataClient,
  params: GetOwnersForNftParams,
  options?: RequestOptions,
): Promise<GetOwnersForNftResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getOwnersForNFT",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
