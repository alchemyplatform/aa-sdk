import { resolveNetwork } from "@alchemy/common";
import { DATA_API_URL } from "../../internal/endpoints.js";
import {
  getRestClient,
  type DataClient,
  type RequestOptions,
} from "../../internal/clientHelpers.js";
import type { GetNftsByAddressBody } from "../../generated/rest/portfolio.schema.js";
import type { PortfolioRestSchema } from "../../schema/rest.js";
import type {
  GetNftsByAddressParams,
  GetNftsByAddressResult,
} from "../../types.js";

/**
 * Fetches NFTs for one or more addresses across one or more networks in a
 * single call.
 * This is a multi-network request against the global Data API: networks
 * travel in the request body, so the client's chain is not involved.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsByAddressParams} params Addresses paired with networks, plus options
 * @param {RequestOptions} [options] Per-request options (abort signal)
 * @returns {Promise<GetNftsByAddressResult>} The owned NFTs and pagination cursor
 */
export async function getNftsByAddress(
  client: DataClient,
  params: GetNftsByAddressParams,
  options?: RequestOptions,
): Promise<GetNftsByAddressResult> {
  const { addresses, ...rest } = params;
  const restClient = getRestClient<PortfolioRestSchema>(client, DATA_API_URL);
  return restClient.request({
    route: "assets/nfts/by-address",
    method: "POST",
    // The cast widens the spec's network-slug enum: the SDK deliberately
    // accepts registry-unknown slugs as an escape hatch.
    body: {
      ...rest,
      addresses: addresses.map(({ networks, ...entry }) => ({
        ...entry,
        networks: networks.map((n) => resolveNetwork(n).slug),
      })),
    } as GetNftsByAddressBody,
    signal: options?.signal,
  });
}
