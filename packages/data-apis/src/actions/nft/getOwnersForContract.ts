import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetOwnersForContractParams,
  GetOwnersForContractResult,
} from "../../types.js";

/**
 * Fetches all owners for an NFT contract. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetOwnersForContractParams} params Contract address, optional network override, and balance options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetOwnersForContractResult>} The contract's owners
 */
export async function getOwnersForContract(
  client: DataClient,
  params: GetOwnersForContractParams,
  options?: RequestOptions,
): Promise<GetOwnersForContractResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getOwnersForContract",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
