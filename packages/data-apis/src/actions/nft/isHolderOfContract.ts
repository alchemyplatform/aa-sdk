import { getNftApiUrl } from "../../internal/endpoints.js";
import {
  getRestClient,
  resolveRequestNetwork,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { NftRestSchema } from "../../schema/rest.js";
import type {
  IsHolderOfContractParams,
  IsHolderOfContractResult,
} from "../../types.js";

/**
 * Checks whether a wallet holds any NFT from a contract. The network is resolved per
 * request: an explicit `network` param wins, otherwise the client's
 * configured network/chain applies.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {IsHolderOfContractParams} params Wallet address, contract address, and optional network override
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<IsHolderOfContractResult>} The holder check result
 */
export async function isHolderOfContract(
  client: DataClient,
  params: IsHolderOfContractParams,
  options?: RequestOptions,
): Promise<IsHolderOfContractResult> {
  const { network, ...query } = params;
  const { slug } = resolveRequestNetwork(client, network);
  const restClient = getRestClient<NftRestSchema>(client, getNftApiUrl(slug));
  return restClient.request({
    route: "isHolderOfContract",
    method: "GET",
    query,
    signal: options?.signal,
  });
}
