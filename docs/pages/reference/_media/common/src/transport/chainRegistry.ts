/**
 * Internal registry mapping chain IDs to Alchemy RPC base URLs.
 * This replaces the need for custom chain exports with embedded Alchemy URLs.
 */
export const ALCHEMY_RPC_MAPPING: Record<number, string> = {
  // Ethereum networks
  1: "https://eth-mainnet.g.alchemy.com/v2", // mainnet
  11155111: "https://eth-sepolia.g.alchemy.com/v2", // sepolia
  5: "https://eth-goerli.g.alchemy.com/v2", // goerli

  // Arbitrum networks
  42161: "https://arb-mainnet.g.alchemy.com/v2", // arbitrum
  421613: "https://arb-goerli.g.alchemy.com/v2", // arbitrumGoerli
  421614: "https://arb-sepolia.g.alchemy.com/v2", // arbitrumSepolia

  // Optimism networks
  10: "https://opt-mainnet.g.alchemy.com/v2", // optimism
  420: "https://opt-goerli.g.alchemy.com/v2", // optimismGoerli
  11155420: "https://opt-sepolia.g.alchemy.com/v2", // optimismSepolia

  // Base networks
  8453: "https://base-mainnet.g.alchemy.com/v2", // base
  84531: "https://base-goerli.g.alchemy.com/v2", // baseGoerli
  84532: "https://base-sepolia.g.alchemy.com/v2", // baseSepolia

  // Polygon networks
  137: "https://polygon-mainnet.g.alchemy.com/v2", // polygon
  80001: "https://polygon-mumbai.g.alchemy.com/v2", // polygonMumbai
  80002: "https://polygon-amoy.g.alchemy.com/v2", // polygonAmoy

  // World Chain networks
  480: "https://worldchain-mainnet.g.alchemy.com/v2", // worldChain
  4801: "https://worldchain-sepolia.g.alchemy.com/v2", // worldChainSepolia

  // Shape networks
  360: "https://shape-mainnet.g.alchemy.com/v2", // shape
  11011: "https://shape-sepolia.g.alchemy.com/v2", // shapeSepolia

  // Unichain networks
  130: "https://unichain-mainnet.g.alchemy.com/v2", // unichainMainnet
  1301: "https://unichain-sepolia.g.alchemy.com/v2", // unichainSepolia

  // Soneium networks
  1868: "https://soneium-mainnet.g.alchemy.com/v2", // soneiumMainnet
  1946: "https://soneium-minato.g.alchemy.com/v2", // soneiumMinato

  // OPBNB networks
  204: "https://opbnb-mainnet.g.alchemy.com/v2", // opbnbMainnet
  5611: "https://opbnb-testnet.g.alchemy.com/v2", // opbnbTestnet

  // BeraChain networks
  80084: "https://berachain-bartio.g.alchemy.com/v2", // beraChainBartio

  // Ink networks
  57073: "https://ink-mainnet.g.alchemy.com/v2", // inkMainnet
  763373: "https://ink-sepolia.g.alchemy.com/v2", // inkSepolia

  // Monad networks
  10143: "https://monad-testnet.g.alchemy.com/v2", // monadTestnet

  // Openloot networks
  905905: "https://openloot-sepolia.g.alchemy.com/v2", // openlootSepolia

  // Gensyn networks
  685685: "https://gensyn-testnet.g.alchemy.com/v2", // gensynTestnet

  // Rise networks
  11155931: "https://rise-testnet.g.alchemy.com/v2", // riseTestnet

  // Story networks
  1514: "https://story-mainnet.g.alchemy.com/v2", // storyMainnet
  1315: "https://story-aeneid.g.alchemy.com/v2", // storyAeneid

  // Celo networks
  42220: "https://celo-mainnet.g.alchemy.com/v2", // celoMainnet
  44787: "https://celo-alfajores.g.alchemy.com/v2", // celoAlfajores

  // Tea networks
  10218: "https://tea-sepolia.g.alchemy.com/v2", // teaSepolia
};

/**
 * Gets the Alchemy RPC base URL for a given chain ID.
 *
 * @param {number} chainId The chain ID to lookup
 * @returns {string | undefined} The Alchemy RPC base URL or undefined if not supported
 *
 * @example
 * ```ts
 * const rpcUrl = getAlchemyRpcUrl(1); // "https://eth-mainnet.g.alchemy.com/v2"
 * const customUrl = getAlchemyRpcUrl(999); // undefined
 * ```
 */
export function getAlchemyRpcUrl(chainId: number): string | undefined {
  return ALCHEMY_RPC_MAPPING[chainId];
}

/**
 * Checks if a chain ID is supported by the Alchemy RPC registry.
 *
 * @param {number} chainId The chain ID to check
 * @returns {boolean} True if the chain is supported, false otherwise
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in ALCHEMY_RPC_MAPPING;
}

/**
 * Gets all supported chain IDs from the registry.
 *
 * @returns {number[]} Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(ALCHEMY_RPC_MAPPING).map(Number);
}
