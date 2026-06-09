import { alchemyTransport } from "@alchemy/common";
import { getRpcUrl } from "../../internal/endpoints.js";
import {
  getTransportConfig,
  resolveRequestNetwork,
  type DataClient,
} from "../../internal/clientHelpers.js";
import type { DataRpcSchema } from "../../schema/rpc.js";
import type {
  GetAssetTransfersParams,
  GetAssetTransfersResult,
} from "../../types.js";
import type { EIP1193RequestFn } from "viem";

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

  const request = (() => {
    if (!network) {
      return client.request as EIP1193RequestFn<DataRpcSchema>;
    }
    const { slug } = resolveRequestNetwork(client, network);
    const derived = alchemyTransport({
      ...getTransportConfig(client),
      url: getRpcUrl(slug),
    })({ retryCount: 0 });
    return derived.request as EIP1193RequestFn<DataRpcSchema>;
  })();

  return request({
    method: "alchemy_getAssetTransfers",
    params: [rpcParams],
  });
}
