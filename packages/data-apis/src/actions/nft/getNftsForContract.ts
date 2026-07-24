import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetNftsForContractParams,
  GetNftsForContractResult,
} from "../../types.js";

/**
 * Fetches all NFTs for a given contract. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForContractParams} params Contract address, optional network override, and paging filters
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftsForContractResult>} The contract's NFTs and pagination cursor
 */
export async function getNftsForContract(
  client: DataClient,
  params: GetNftsForContractParams,
  options?: RequestOptions,
): Promise<GetNftsForContractResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTsForContract",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
