/**
 * Chain IDs for Universal Account supported chains
 *
 * These match the chain IDs used by Particle Network's Universal Accounts.
 * You can also import CHAIN_ID directly from @particle-network/universal-account-sdk
 *
 * @see https://developers.particle.network/universal-accounts/cha/chains
 */
export const CHAIN_ID = {
  // EVM Chains
  /** Ethereum Mainnet */
  ETHEREUM: 1,
  /** BNB Chain (BSC) */
  BNB_CHAIN: 56,
  /** Mantle */
  MANTLE: 5000,
  /** Monad */
  MONAD: 143,
  /** Plasma */
  PLASMA: 9745,
  /** X Layer */
  X_LAYER: 196,
  /** Base */
  BASE: 8453,
  /** Arbitrum One */
  ARBITRUM: 42161,
  /** Avalanche C-Chain */
  AVALANCHE: 43114,
  /** Optimism */
  OPTIMISM: 10,
  /** Polygon */
  POLYGON: 137,
  /** HyperEVM */
  HYPER_EVM: 999,
  /** Berachain */
  BERACHAIN: 80094,
  /** Linea */
  LINEA: 59144,
  /** Sonic */
  SONIC: 146,
  /** Merlin */
  MERLIN: 4200,

  // Non-EVM Chains
  /** Solana Mainnet */
  SOLANA: 101,
} as const;

/**
 * Type for chain IDs
 */
export type ChainId = (typeof CHAIN_ID)[keyof typeof CHAIN_ID];

/**
 * Supported token types for Universal Accounts
 *
 * These are the primary asset types that can be used across chains.
 */
export const TOKEN_TYPE = {
  /** Ethereum */
  ETH: "ETH",
  /** USD Coin */
  USDC: "USDC",
  /** Tether USD */
  USDT: "USDT",
  /** Solana */
  SOL: "SOL",
  /** Bitcoin (wrapped) */
  BTC: "BTC",
  /** BNB */
  BNB: "BNB",
  /** Mantle Native token */
  MNT: "MNT",
} as const;

/**
 * Type for token types
 */
export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

/**
 * Native token address (zero address)
 * Use this for native tokens like ETH, AVAX, MATIC, etc.
 */
export const NATIVE_TOKEN_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;
