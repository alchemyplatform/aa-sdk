import { resolveNetwork } from "@alchemy/common";
import { DATA_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { GetNftContractsByAddressBody } from "../../generated/rest/portfolio.schema.js";
import type { PortfolioRestSchema } from "../../schema/rest.js";
import type {
  GetNftContractsByAddressParams,
  GetNftContractsByAddressResult,
} from "../../types.js";

/**
 * Fetches NFT contracts for one or more addresses across one or more
 * networks in a single call.
 * This is a multi-network request against the global Data API: networks
 * travel in the request body, so the client's chain is not involved.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftContractsByAddressParams} params Addresses paired with networks, plus options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftContractsByAddressResult>} The owned NFT contracts and pagination cursor
 */
export async function getNftContractsByAddress(
  client: DataClient,
  params: GetNftContractsByAddressParams,
  options?: RequestOptions,
): Promise<GetNftContractsByAddressResult> {
  const { addresses, ...rest } = params;
  const restClient = getRestClient<PortfolioRestSchema>(client, DATA_API_URL);
  return restClient.request({
    route: "assets/nfts/contracts/by-address",
    method: "POST",
    // The cast widens the spec's network-slug enum: the SDK deliberately
    // accepts registry-unknown slugs as an escape hatch.
    body: {
      ...rest,
      addresses: addresses.map(({ networks, ...entry }) => ({
        ...entry,
        networks: networks.map((n) => resolveNetwork(n).slug),
      })),
    } as GetNftContractsByAddressBody,
    signal: options?.signal,
  });
}
