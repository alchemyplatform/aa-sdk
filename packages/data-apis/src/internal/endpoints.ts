// Per-service endpoint resolution. The slug comes from resolveNetwork in
// @alchemy/common, so all three network input formats land here identically.

/** Global, chain-agnostic Data API (multi-network request bodies). */
export const DATA_API_URL = "https://api.g.alchemy.com/data/v1";

/** Global Prices API (chain-agnostic or networks in the request body). */
export const PRICES_API_URL = "https://api.g.alchemy.com/prices/v1";

/**
 * Network-scoped NFT v3 base URL.
 *
 * @param {string} slug The Alchemy network slug
 * @returns {string} The NFT v3 base URL for that network
 */
export const getNftApiUrl = (slug: string): string =>
  `https://${slug}.g.alchemy.com/nft/v3`;

/**
 * Network-scoped JSON-RPC base URL.
 *
 * @param {string} slug The Alchemy network slug
 * @returns {string} The RPC base URL for that network
 */
export const getRpcUrl = (slug: string): string =>
  `https://${slug}.g.alchemy.com/v2`;
