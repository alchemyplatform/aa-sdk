import {
  getRpcRequest,
  type DataClient,
} from "../../internal/clientHelpers.js";
import type {
  GetTokenMetadataParams,
  GetTokenMetadataResult,
} from "../../types.js";

/**
 * Fetches metadata (name, symbol, decimals, logo) for a token contract via
 * the `alchemy_getTokenMetadata` JSON-RPC method. Without a `network`
 * override this uses the client's transport; with one, a transport instance
 * is derived for the override network.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenMetadataParams} params The contract address and optional network override
 * @returns {Promise<GetTokenMetadataResult>} The token metadata
 */
export async function getTokenMetadata(
  client: DataClient,
  params: GetTokenMetadataParams,
): Promise<GetTokenMetadataResult> {
  const { network, contractAddress } = params;
  const request = getRpcRequest(client, network);
  return request({
    method: "alchemy_getTokenMetadata",
    params: [contractAddress],
  });
}
