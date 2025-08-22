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

export const worldChainSepolia = defineChain({
  id: 4801,
  name: "World Chain Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://worldchain-sepolia.g.alchemy.com/v2"],
    },
  },
  testnet: true,
});

export const worldChain = defineChain({
  id: 480,
  name: "World Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://worldchain-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const unichainMainnet = defineChain({
  id: 130,
  name: "Unichain Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://unichain-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const soneiumMainnet = defineChain({
  id: 1868,
  name: "Soneium Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://soneium-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const opbnbTestnet = defineChain({
  id: 5611,
  name: "OPBNB Testnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://opbnb-testnet.g.alchemy.com/v2"],
    },
  },
  testnet: true,
});

export const opbnbMainnet = defineChain({
  id: 204,
  name: "OPBNB Mainnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://opbnb-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const beraChainBartio = defineChain({
  id: 80084,
  name: "BeraChain Bartio",
  nativeCurrency: { name: "Bera", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://berachain-bartio.g.alchemy.com/v2"],
    },
  },
  testnet: true,
});

export const inkMainnet = defineChain({
  id: 57073,
  name: "Ink Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ink-mainnet.g.alchemy.com/v2"],
    },
  },
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

export const celoMainnet = defineChain({
  id: 42220,
  name: "Celo Mainnet",
  nativeCurrency: { name: "Celo native asset", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://celo-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://celo.blockscout.com/",
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
