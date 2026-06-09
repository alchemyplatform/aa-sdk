import {
  AlchemyRestClient,
  resolveNetwork,
  type AlchemyTransport,
  type AlchemyTransportConfig,
  type NetworkInput,
  type ResolvedNetwork,
  type RestRequestSchema,
} from "@alchemy/common";
import { BaseError } from "@alchemy/common";
import type { Chain, Client } from "viem";

/** The minimal client shape data actions operate on. */
export type DataClient = Client<AlchemyTransport, Chain | undefined>;

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
