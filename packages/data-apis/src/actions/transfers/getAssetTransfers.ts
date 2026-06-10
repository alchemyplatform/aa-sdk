import {
  getRpcRequest,
  type DataClient,
} from "../../internal/clientHelpers.js";
import type {
  GetAssetTransfersParams,
  GetAssetTransfersResult,
} from "../../types.js";

/**
 * Fetches historical asset transfers (external, internal, token) for the
 * resolved network via the `alchemy_getAssetTransfers` JSON-RPC method.
 *
 * Without a `network` override this is a plain viem action over the client's
 * Alchemy transport. With an override, a transport instance is derived from
 * the client's transport config and pointed at the override network's RPC URL
 * — the same mechanism the transport's tracing support uses.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetAssetTransfersParams} params Transfer filters and optional network override
 * @returns {Promise<GetAssetTransfersResult>} The matching transfers and pagination cursor
 */
export async function getAssetTransfers(
  client: DataClient,
  params: GetAssetTransfersParams,
): Promise<GetAssetTransfersResult> {
  const { network, ...rpcParams } = params;
  const request = getRpcRequest(client, network);
  return request({
    method: "alchemy_getAssetTransfers",
    params: [rpcParams],
  });
}
