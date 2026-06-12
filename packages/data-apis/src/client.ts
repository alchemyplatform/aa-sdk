import {
  resolveNetwork,
  type AlchemyNetwork,
  type AlchemyRestClientParams,
} from "@alchemy/common/core";
import { dataActions, type DataActions } from "./decorator.js";
import type { DataClient } from "./internal/clientHelpers.js";

export type AlchemyDataClientOptions = AlchemyRestClientParams & {
  /**
   * Default network for network-scoped calls (NFT, Token, Transfers).
   * Accepts an Alchemy slug ("eth-mainnet") or a CAIP-2 id ("eip155:1",
   * "solana:mainnet"). Optional: multi-network calls (Portfolio, Prices)
   * take networks per request, and single-network calls accept a
   * per-request `network` override. Holding a viem chain? The bridge is
   * `eip155:${chain.id}`.
   */
  network?: AlchemyNetwork;
};

export type AlchemyDataClient = DataClient & DataActions;

/**
 * Creates a Data API client: a plain, dependency-free container holding the
 * connection config (apiKey/jwt/proxy url, retry and timeout defaults) and an
 * optional default network, with the Data API actions attached by namespace.
 *
 * @example
 * ```ts
 * import { createDataClient } from "@alchemy/data-apis";
 *
 * const data = createDataClient({
 *   apiKey: process.env.ALCHEMY_API_KEY,
 *   network: "eth-mainnet", // or "eip155:1"; optional for portfolio/prices
 * });
 *
 * const nfts = await data.nft.getNftsForOwner({ owner: "0x..." });
 * ```
 *
 * @param {AlchemyDataClientOptions} options Auth (apiKey/jwt/proxy url), retry/timeout defaults, and default network
 * @returns {AlchemyDataClient} The Data API client
 */
export function createDataClient(
  options: AlchemyDataClientOptions,
): AlchemyDataClient {
  const { network, ...config } = options;
  const core: DataClient = {
    config,
    // Eager resolution keeps fail-fast behavior for malformed network inputs.
    network: network != null ? resolveNetwork(network) : undefined,
  };
  return Object.assign(core, dataActions(core));
}
