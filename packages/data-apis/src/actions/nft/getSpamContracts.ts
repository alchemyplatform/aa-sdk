import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetSpamContractsParams,
  GetSpamContractsResult,
} from "../../types.js";

/**
 * Fetches the full list of contracts classified as spam on a network. The
 * network is resolved per request: an explicit `network` param wins,
 * otherwise the client's configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetSpamContractsParams} [params] Optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetSpamContractsResult>} The spam contract addresses
 */
export async function getSpamContracts(
  client: DataClient,
  params: GetSpamContractsParams = {},
  options?: RequestOptions,
): Promise<GetSpamContractsResult> {
  const { slug } = resolveRequestNetwork(client, params.network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getSpamContracts",
    method: "GET",
    signal: options?.signal,
  });
}
