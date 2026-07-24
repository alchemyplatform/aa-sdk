import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  GetContractMetadataBatchParams,
  GetContractMetadataBatchResult,
} from "../../types.js";

/**
 * Fetches metadata for multiple NFT contracts in one call. The network is
 * resolved per request: an explicit `network` param wins, otherwise the
 * client's configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetContractMetadataBatchParams} params The contract addresses and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetContractMetadataBatchResult>} Metadata for each requested contract
 */
export async function getContractMetadataBatch(
  client: DataClient,
  params: GetContractMetadataBatchParams,
  options?: RequestOptions,
): Promise<GetContractMetadataBatchResult> {
  const { network, ...body } = params;
  const { slug } = resolveRequestNetwork(client, network);

  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "getContractMetadataBatch",
    method: "POST",
    body,
    signal: options?.signal,
  });
}
