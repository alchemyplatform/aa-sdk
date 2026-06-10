import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetContractMetadataParams,
  GetContractMetadataResult,
} from "../../types.js";

/**
 * Fetches metadata for an NFT contract. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetContractMetadataParams} params Contract address and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetContractMetadataResult>} The contract's metadata
 */
export async function getContractMetadata(
  client: DataClient,
  params: GetContractMetadataParams,
  options?: RequestOptions,
): Promise<GetContractMetadataResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getContractMetadata",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
