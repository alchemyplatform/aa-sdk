/**
 * Custom chain definitions for Alchemy SDK.
 *
 * This module provides chain definitions for networks not yet available in viem.
 * For standard networks (Ethereum, Arbitrum, Base, etc.), import directly from "viem/chains".
 * All chains work automatically with alchemyTransport via the internal registry lookup.
 *
 * @example
 * ```typescript
 * // Standard chains - import from viem
 * import { sepolia, arbitrum, base } from "viem/chains";
 *
 * // Custom chains - import from here
 * import { worldChain, unichainMainnet } from "@alchemy/common/chains";
 * ```
 */
import { defineChain } from "viem";

export const fraxtalSepolia = defineChain({
  id: 2523,
  name: "Fraxtal Sepolia",
  nativeCurrency: { name: "Frax Ether", symbol: "frxETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet-sepolia.frax.com"],
    },
  },
  testnet: true,
});

export const openlootSepolia = defineChain({
  id: 905905,
  name: "Openloot Sepolia",
  nativeCurrency: { name: "Openloot", symbol: "OL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://openloot-sepolia.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://openloot-sepolia.explorer.alchemy.com",
    },
  },
  testnet: true,
});

export const gensynTestnet = defineChain({
  id: 685685,
  name: "Gensyn Testnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://gensyn-testnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://gensyn-testnet.explorer.alchemy.com",
    },
  },
  testnet: true,
});

export const riseTestnet = defineChain({
  id: 11155931,
  name: "Rise Testnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rise-testnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://explorer.testnet.riselabs.xyz",
    },
  },
  testnet: true,
});

export const storyMainnet = defineChain({
  id: 1514,
  name: "Story Mainnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://story-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://www.storyscan.io",
    },
  },
});

export const teaSepolia = defineChain({
  id: 10218,
  name: "Tea Sepolia",
  nativeCurrency: { name: "TEA", symbol: "TEA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://tea-sepolia.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://sepolia.tea.xyz/",
    },
  },
  testnet: true,
});
