import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  SummarizeNftAttributesParams,
  SummarizeNftAttributesResult,
} from "../../types.js";

/**
 * Summarizes attribute prevalence for an NFT contract. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {SummarizeNftAttributesParams} params Contract address and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<SummarizeNftAttributesResult>} The attribute summary
 */
export async function summarizeNftAttributes(
  client: DataClient,
  params: SummarizeNftAttributesParams,
  options?: RequestOptions,
): Promise<SummarizeNftAttributesResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "summarizeNFTAttributes",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
