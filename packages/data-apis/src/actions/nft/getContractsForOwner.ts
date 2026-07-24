import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import { bracketArrayKeys } from "../../internal/query.js";
import type { GetContractsForOwnerQuery } from "../../generated/rest/nft.schema.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetContractsForOwnerParams,
  GetContractsForOwnerResult,
} from "../../types.js";

/**
 * Fetches all NFT contracts an address holds tokens from. The network is
 * resolved per request: an explicit `network` param wins, otherwise the
 * client's configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetContractsForOwnerParams} params Owner address, optional network override, and filters
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetContractsForOwnerResult>} The owned contracts and pagination cursor
 */
export async function getContractsForOwner(
  client: DataClient,
  params: GetContractsForOwnerParams,
  options?: RequestOptions,
): Promise<GetContractsForOwnerResult> {
  const { network, ...rest } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getContractsForOwner",
    method: "GET",
    query: bracketArrayKeys(rest, [
      "excludeFilters",
      "includeFilters",
    ]) as GetContractsForOwnerQuery,
    signal: options?.signal,
  });
}
