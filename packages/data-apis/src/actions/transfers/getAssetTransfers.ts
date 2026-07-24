import { getRpcClient, type DataClient } from "../../internal/clientHelpers.js";
import type {
  GetAssetTransfersParams,
  GetAssetTransfersResult,
} from "../../types.js";

/**
 * Fetches historical asset transfers (external, internal, token) for the
 * resolved network via the `alchemy_getAssetTransfers` JSON-RPC method. The
 * network is resolved per request: an explicit `network` param wins,
 * otherwise the client's configured default applies.
 *
 * @param {DataClient} client A Data API client
 * @param {GetAssetTransfersParams} params Transfer filters and optional network override
 * @returns {Promise<GetAssetTransfersResult>} The matching transfers and pagination cursor
 */
export async function getAssetTransfers(
  client: DataClient,
  params: GetAssetTransfersParams,
): Promise<GetAssetTransfersResult> {
  const { network, ...rpcParams } = params;
  const rpc = getRpcClient(client, network);
  return rpc.request({
    method: "alchemy_getAssetTransfers",
    params: [rpcParams],
  });
}
