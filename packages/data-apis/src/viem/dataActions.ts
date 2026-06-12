// PARKED: the viem adapter for @alchemy/data-apis. Not exported from the
// package; it becomes the `/viem` subpath export when adapter demand
// warrants (post-v1, per the approved standalone-core direction). Kept here
// with tests so it stays working against the core.

import { resolveNetwork } from "@alchemy/common/core";
import type { AlchemyTransport, AlchemyTransportConfig } from "@alchemy/common";
import type { Chain, Client } from "viem";
import {
  dataActions as coreDataActions,
  type DataActions,
} from "../decorator.js";
import type { DataClient } from "../internal/clientHelpers.js";

/**
 * Attaches the Data API actions to an existing viem client configured with
 * an Alchemy transport: `client.extend(dataActions)`. Auth and retry/timeout
 * settings are read from the transport's config; the client's chain (when
 * present and registry-known) becomes the default network.
 *
 * @param {Client<AlchemyTransport, Chain | undefined>} client A viem client with an Alchemy transport
 * @returns {DataActions} The namespaced Data API actions
 */
export function dataActions(
  client: Client<AlchemyTransport, Chain | undefined>,
): DataActions {
  const config = client.transport.config as AlchemyTransportConfig;
  const chain = client.chain;
  const customSlug = (chain?.custom as { alchemyNetwork?: string } | undefined)
    ?.alchemyNetwork;

  const core: DataClient = {
    config: {
      apiKey: config.apiKey,
      jwt: config.jwt,
      url: config.url,
      headers: config.fetchOptions?.headers,
      retryCount: config.retryCount,
      retryDelay: config.retryDelay,
      timeout: config.timeout,
    },
    network: customSlug
      ? resolveNetwork(customSlug)
      : chain
        ? resolveNetwork(chain)
        : undefined,
  };
  return coreDataActions(core);
}
