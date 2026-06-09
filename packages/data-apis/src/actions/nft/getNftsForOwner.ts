import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
} from "../../internal/clientHelpers.js";
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
 * @returns {Promise<GetNftsForOwnerResult>} The owned NFTs and pagination cursor
 */
export async function getNftsForOwner(
  client: DataClient,
  params: GetNftsForOwnerParams,
): Promise<GetNftsForOwnerResult> {
  const { network, owner, contractAddresses, ...rest } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const query = new URLSearchParams({ owner });
  for (const [key, value] of Object.entries(rest)) {
    if (value != null) query.set(key, String(value));
  }
  for (const address of contractAddresses ?? []) {
    query.append("contractAddresses[]", address);
  }

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  // TODO(common-hardening): AlchemyRestClient should take query params
  // first-class instead of this cast; tracked in the data SDK plan.
  return restClient.request({
    route: `getNFTsForOwner?${query.toString()}` as "getNFTsForOwner",
    method: "GET",
  });
}
