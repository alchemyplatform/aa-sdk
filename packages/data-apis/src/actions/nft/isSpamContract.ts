import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  IsSpamContractParams,
  IsSpamContractResult,
} from "../../types.js";

/**
 * Checks whether a contract is classified as spam. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {IsSpamContractParams} params Contract address and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<IsSpamContractResult>} The spam classification
 */
export async function isSpamContract(
  client: DataClient,
  params: IsSpamContractParams,
  options?: RequestOptions,
): Promise<IsSpamContractResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "isSpamContract",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
