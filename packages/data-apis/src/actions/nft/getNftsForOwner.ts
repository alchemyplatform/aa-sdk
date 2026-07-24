import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import { bracketArrayKeys } from "../../internal/query.js";
import type { GetNftsForOwnerQuery } from "../../generated/rest/nft.schema.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetNftsForOwnerParams,
  GetNftsForOwnerResult,
} from "../../types.js";

/**
 * Fetches NFTs owned by an address on a single network. The network is
 * resolved per request: an explicit `network` param wins, otherwise the
 * client's configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForOwnerParams} params Owner address, optional network override, and filters
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftsForOwnerResult>} The owned NFTs and pagination cursor
 */
export async function getNftsForOwner(
  client: DataClient,
  params: GetNftsForOwnerParams,
  options?: RequestOptions,
): Promise<GetNftsForOwnerResult> {
  const { network, ...rest } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getNFTsForOwner",
    method: "GET",
    query: bracketArrayKeys(rest, [
      "contractAddresses",
      "excludeFilters",
      "includeFilters",
    ]) as GetNftsForOwnerQuery,
    signal: options?.signal,
  });
}
