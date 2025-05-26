import * as chains from "viem/chains";
import { mainnet, type Chain } from "viem/chains";

export const ChainsById: Map<number, chains.Chain> = new Map(
  Object.values(chains).map((x) => [x.id, x]),
);

/**
 * Converts a given chain ID to a coin type, following specific standards for mainnet and non-mainnet chains.
 *
 * @example
 * ```ts
 * import { convertChainIdToCoinType } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 *
 * const coinType = convertChainIdToCoinType(sepolia.id);
 * ```
 *
 * @param {number} chainId the blockchain chain ID that you want to convert to a coin type
 * @returns {number} the corresponding coin type for the given chain ID
 */
export const convertChainIdToCoinType = (chainId: number): number => {
  if (chainId === mainnet.id) {
    // this comes from [ensip-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution)
    return 60;
  }

  // this is using [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution) and assumes this is how mappings are stored for non mainnet chains
  return (0x80000000 | chainId) >>> 0;
};

/**
 * Converts a coin type to a chain ID based on predefined mappings. This function follows ENSIP-9 for coin type 60 and ENSIP-11 for other coin types.
 *
 * @example
 * ```ts
 * import { convertChainIdToCoinType, convertCoinTypeToChainId } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 *
 * const coinType = convertChainIdToCoinType(sepolia.id);
 * const chainId = convertCoinTypeToChainId(coinType);
 * ```
 *
 * @param {number} coinType the coin type to be converted to a chain ID
 * @returns {number} the corresponding chain ID
 */
export const convertCoinTypeToChainId = (coinType: number): number => {
  if (coinType === 60) {
    // this comes from [ensip-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution)
    return mainnet.id;
  }

  // this is using [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution) and assumes this is how mappings are stored for non mainnet chains
  return (0x7fffffff & coinType) >> 0;
};

/**
 * Converts a coin type to its corresponding blockchain chain based on a predefined mapping.
 *
 * @example
 * ```ts
 * import { convertChainIdToCoinType, convertCoinTypeToChain } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 *
 * const coinType = convertChainIdToCoinType(sepolia.id);
 * const chain = convertCoinTypeToChain(coinType);
 * ```
 *
 * @param {number} coinType The numerical identifier for the coin type
 * @returns {Chain} The corresponding blockchain chain
 * @throws {Error} If the coin type does not map to a supported chain
 */
export const convertCoinTypeToChain = (coinType: number): Chain => {
  const chainId = convertCoinTypeToChainId(coinType);
  const chain = ChainsById.get(chainId);
  if (!chain) {
    throw new Error("CoinType does not map to a supported chain");
  }

  return chain;
};
