import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type { IsAirdropNftParams, IsAirdropNftResult } from "../../types.js";

/**
 * Checks whether an NFT was airdropped to its owner. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {IsAirdropNftParams} params Contract address, token id, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<IsAirdropNftResult>} The airdrop classification
 */
export async function isAirdropNft(
  client: DataClient,
  params: IsAirdropNftParams,
  options?: RequestOptions,
): Promise<IsAirdropNftResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "isAirdropNFT",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
