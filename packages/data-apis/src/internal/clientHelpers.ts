import {
  AlchemyError,
  AlchemyJsonRpcClient,
  AlchemyRestClient,
  resolveNetwork,
  type AlchemyNetwork,
  type AlchemyRestClientParams,
  type ResolvedNetwork,
  type RestRequestSchema,
} from "@alchemy/common/core";
import { getRpcUrl } from "./endpoints.js";
import type { DataRpcSchema } from "../schema/rpc.js";

/**
 * The minimal client shape data actions operate on: validated connection
 * config plus an optional pre-resolved default network. A plain object — no
 * chain-library client underneath.
 */
export type DataClient = {
  config: AlchemyRestClientParams;
  network?: ResolvedNetwork;
};

/** Per-request options accepted by data actions. */
export type RequestOptions = {
  /** Aborts the request (and any pending retries). */
  signal?: AbortSignal;
};

/**
 * Resolves the network for a request: explicit per-request input wins,
 * otherwise the client's default network (set at client creation).
 *
 * @param {DataClient} client The client whose default network applies
 * @param {AlchemyNetwork} [override] Per-request network override (slug or CAIP-2)
 * @returns {ResolvedNetwork} The resolved network
 */
export function resolveRequestNetwork(
  client: DataClient,
  override?: AlchemyNetwork,
): ResolvedNetwork {
  if (override != null) {
    return resolveNetwork(override);
  }
  if (client.network) {
    return client.network;
  }
  throw new AlchemyError(
    "No network available: pass `network` on the request or configure the client with a network.",
  );
}

/**
 * Builds a typed REST client for a service base URL, reusing the client's
 * auth and retry/timeout configuration so REST and JSON-RPC requests share
 * one connection config. The client-level `url` override applies to the
 * JSON-RPC channel only; REST URLs are service-scoped by construction.
 *
 * @param {DataClient} client The client whose config supplies auth
 * @param {string} url The service base URL
 * @returns {AlchemyRestClient<Schema>} A typed REST client
 */
export function getRestClient<Schema extends RestRequestSchema>(
  client: DataClient,
  url: string,
): AlchemyRestClient<Schema> {
  const { url: _rpcUrlOverride, ...config } = client.config;
  return new AlchemyRestClient<Schema>({ ...config, url });
}

/**
 * Builds a typed JSON-RPC client for the resolved network: the client's
 * configured `url` (proxy escape hatch) wins, otherwise the network-scoped
 * Alchemy RPC URL. Auth and retry/timeout config come from the client.
 *
 * @param {DataClient} client The client whose config supplies auth
 * @param {AlchemyNetwork} [network] Optional per-request network override
 * @returns {AlchemyJsonRpcClient<DataRpcSchema>} A typed JSON-RPC client
 */
export function getRpcClient(
  client: DataClient,
  network?: AlchemyNetwork,
): AlchemyJsonRpcClient<DataRpcSchema> {
  const { url, ...config } = client.config;
  const resolvedUrl =
    url ?? getRpcUrl(resolveRequestNetwork(client, network).slug);
  return new AlchemyJsonRpcClient<DataRpcSchema>({
    ...config,
    url: resolvedUrl,
  });
}
