import {
  AlchemyRestClient,
  alchemyTransport,
  resolveNetwork,
  type AlchemyTransport,
  type AlchemyTransportConfig,
  type NetworkInput,
  type ResolvedNetwork,
  type RestRequestSchema,
} from "@alchemy/common";
import { BaseError } from "@alchemy/common";
import type { Chain, Client, EIP1193RequestFn } from "viem";
import { getRpcUrl } from "./endpoints.js";
import type { DataRpcSchema } from "../schema/rpc.js";

/** The minimal client shape data actions operate on. */
export type DataClient = Client<AlchemyTransport, Chain | undefined>;

/** Per-request options accepted by data actions. */
export type RequestOptions = {
  /** Aborts the request (and any pending retries). */
  signal?: AbortSignal;
};

/**
 * Reads the AlchemyTransportConfig back off an instantiated client transport.
 * The transport attaches its creation config to the transport value precisely
 * to support deriving new instances (tracing relies on the same mechanism).
 *
 * @param {DataClient} client The client to read from
 * @returns {AlchemyTransportConfig} The transport's creation config
 */
export function getTransportConfig(client: DataClient): AlchemyTransportConfig {
  return client.transport.config as AlchemyTransportConfig;
}

/**
 * Resolves the network for a request: explicit per-request input wins,
 * otherwise the client's chain (set at client creation). The
 * `custom.alchemyNetwork` field carries slug-configured defaults (e.g. Solana
 * or escape-hatch networks that have no registry chain ID).
 *
 * @param {DataClient} client The client whose chain provides the default
 * @param {NetworkInput} [override] Per-request network override
 * @returns {ResolvedNetwork} The resolved network
 */
export function resolveRequestNetwork(
  client: DataClient,
  override?: NetworkInput,
): ResolvedNetwork {
  if (override != null) {
    return resolveNetwork(override);
  }
  const chain = client.chain;
  const customSlug = (chain?.custom as { alchemyNetwork?: string } | undefined)
    ?.alchemyNetwork;
  if (customSlug) {
    return resolveNetwork(customSlug);
  }
  if (chain) {
    return resolveNetwork(chain);
  }
  throw new BaseError(
    "No network available: pass `network` on the request or configure the client with a network/chain.",
  );
}

/**
 * Builds a typed REST client for a service base URL, reusing the auth
 * (apiKey/JWT) and headers from the viem client's Alchemy transport so REST
 * and JSON-RPC requests share one connection config.
 *
 * @param {DataClient} client The client whose transport supplies auth
 * @param {string} url The service base URL
 * @returns {AlchemyRestClient<Schema>} A typed REST client
 */
export function getRestClient<Schema extends RestRequestSchema>(
  client: DataClient,
  url: string,
): AlchemyRestClient<Schema> {
  const { apiKey, jwt } = getTransportConfig(client);
  return new AlchemyRestClient<Schema>({ apiKey, jwt, url });
}

/**
 * Resolves the JSON-RPC request function for an action: the client's own
 * transport when no override is given, otherwise a transport instance derived
 * from the client's transport config and pointed at the override network's
 * RPC URL (the same mechanism the transport's tracing support uses).
 *
 * @param {DataClient} client The client whose transport (and config) is used
 * @param {NetworkInput} [network] Optional per-request network override
 * @returns {EIP1193RequestFn<DataRpcSchema>} A typed JSON-RPC request function
 */
export function getRpcRequest(
  client: DataClient,
  network?: NetworkInput,
): EIP1193RequestFn<DataRpcSchema> {
  if (!network) {
    return client.request as EIP1193RequestFn<DataRpcSchema>;
  }
  const { slug } = resolveRequestNetwork(client, network);
  const derived = alchemyTransport({
    ...getTransportConfig(client),
    url: getRpcUrl(slug),
  })({ retryCount: 0 });
  return derived.request as EIP1193RequestFn<DataRpcSchema>;
}
