import type { Chain } from "viem";

import { defineChain } from "viem";
import {
  arbitrum as vab,
  arbitrumGoerli as vabg,
  arbitrumSepolia as vabs,
  base as vbase,
  baseGoerli as vbaseg,
  baseSepolia as vbases,
  fraxtal as vfrax,
  goerli as vgo,
  mainnet as vmain,
  optimism as vop,
  optimismGoerli as vopg,
  optimismSepolia as vops,
  polygon as vpg,
  polygonAmoy as vpga,
  polygonMumbai as vpgm,
  sepolia as vsep,
  arbitrumNova as vabn,
  zora as vzora,
  zoraSepolia as vzoras,
} from "viem/chains";

export type AlchemyChainConfig = {
  chain: Chain;
  rpcBaseUrl: string;
};

/**
 * Defines an Alchemy chain configuration by adding an Alchemy-specific RPC base URL to the chain's RPC URLs.
 *
 * @example
 * ```ts
 * import { defineAlchemyChain } from "@account-kit/infra";
 * import { sepolia } from "viem/chains";
 *
 * const chain = defineAlchemyChain({
 *  chain: sepolia,
 *  rpcBaseUrl: "https://eth-sepolia.g.alchemy.com/v2"
 * });
 * ```
 *
 * @param {AlchemyChainConfig} params The parameters for defining the Alchemy chain
 * @param {Chain} params.chain The original chain configuration
 * @param {string} params.rpcBaseUrl The Alchemy-specific RPC base URL
 * @returns {Chain} The updated chain configuration with the Alchemy RPC URL added
 */
export const defineAlchemyChain = ({
  chain,
  rpcBaseUrl,
}: {
  chain: Chain;
  rpcBaseUrl: string;
}): Chain => {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      alchemy: {
        http: [rpcBaseUrl],
      },
    },
  };
};

export const arbitrum: Chain = {
  ...vab,
  rpcUrls: {
    ...vab.rpcUrls,
    alchemy: {
      http: ["https://arb-mainnet.g.alchemy.com/v2"],
    },
  },
};

export const arbitrumGoerli: Chain = {
  ...vabg,
  rpcUrls: {
    ...vabg.rpcUrls,
    alchemy: {
      http: ["https://arb-goerli.g.alchemy.com/v2"],
    },
  },
};

export const arbitrumSepolia: Chain = {
  ...vabs,
  rpcUrls: {
    ...vabs.rpcUrls,
    alchemy: {
      http: ["https://arb-sepolia.g.alchemy.com/v2"],
    },
  },
};
export const goerli: Chain = {
  ...vgo,
  rpcUrls: {
    ...vgo.rpcUrls,
    alchemy: {
      http: ["https://eth-goerli.g.alchemy.com/v2"],
    },
  },
};
export const mainnet: Chain = {
  ...vmain,
  rpcUrls: {
    ...vmain.rpcUrls,
    alchemy: {
      http: ["https://eth-mainnet.g.alchemy.com/v2"],
    },
  },
};
export const optimism: Chain = {
  ...vop,
  rpcUrls: {
    ...vop.rpcUrls,
    alchemy: {
      http: ["https://opt-mainnet.g.alchemy.com/v2"],
    },
  },
};
export const optimismGoerli: Chain = {
  ...vopg,
  rpcUrls: {
    ...vopg.rpcUrls,
    alchemy: {
      http: ["https://opt-goerli.g.alchemy.com/v2"],
    },
  },
};
export const optimismSepolia: Chain = {
  ...vops,
  rpcUrls: {
    ...vops.rpcUrls,
    alchemy: {
      http: ["https://opt-sepolia.g.alchemy.com/v2"],
    },
  },
};
export const sepolia: Chain = {
  ...vsep,
  rpcUrls: {
    ...vsep.rpcUrls,
    alchemy: {
      http: ["https://eth-sepolia.g.alchemy.com/v2"],
    },
  },
};
export const base: Chain = {
  ...vbase,
  rpcUrls: {
    ...vbase.rpcUrls,
    alchemy: {
      http: ["https://base-mainnet.g.alchemy.com/v2"],
    },
  },
};
export const baseGoerli: Chain = {
  ...vbaseg,
  rpcUrls: {
    ...vbaseg.rpcUrls,
    alchemy: {
      http: ["https://base-goerli.g.alchemy.com/v2"],
    },
  },
};
export const baseSepolia: Chain = {
  ...vbases,
  rpcUrls: {
    ...vbases.rpcUrls,
    alchemy: {
      http: ["https://base-sepolia.g.alchemy.com/v2"],
    },
  },
};

export const polygonMumbai: Chain = {
  ...vpgm,
  rpcUrls: {
    ...vpgm.rpcUrls,
    alchemy: {
      http: ["https://polygon-mumbai.g.alchemy.com/v2"],
    },
  },
};

export const polygonAmoy: Chain = {
  ...vpga,
  rpcUrls: {
    ...vpga.rpcUrls,
    alchemy: {
      http: ["https://polygon-amoy.g.alchemy.com/v2"],
    },
  },
};

export const polygon: Chain = {
  ...vpg,
  rpcUrls: {
    ...vpg.rpcUrls,
    alchemy: {
      http: ["https://polygon-mainnet.g.alchemy.com/v2"],
    },
  },
};

export const fraxtal: Chain = {
  ...vfrax,
  rpcUrls: {
    ...vfrax.rpcUrls,
  },
};

export const fraxtalSepolia: Chain = defineChain({
  id: 2523,
  name: "Fraxtal Sepolia",
  nativeCurrency: { name: "Frax Ether", symbol: "frxETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet-sepolia.frax.com"],
    },
  },
});

export const zora: Chain = {
  ...vzora,
  rpcUrls: {
    ...vzora.rpcUrls,
  },
};

export const zoraSepolia: Chain = {
  ...vzoras,
  rpcUrls: {
    ...vzoras.rpcUrls,
  },
};

export const worldChainSepolia: Chain = defineChain({
  id: 4801,
  name: "World Chain Sepolia",
  network: "World Chain Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://worldchain-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://worldchain-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://worldchain-sepolia.g.alchemy.com/v2"],
    },
  },
});

export const worldChain: Chain = defineChain({
  id: 480,
  name: "World Chain",
  network: "World Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://worldchain-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://worldchain-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://worldchain-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const shapeSepolia: Chain = defineChain({
  id: 11011,
  name: "Shape Sepolia",
  network: "Shape Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://shape-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://shape-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://shape-sepolia.g.alchemy.com/v2"],
    },
  },
});

export const shape: Chain = defineChain({
  id: 360,
  name: "Shape",
  network: "Shape",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://shape-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://shape-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://shape-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const unichainMainnet: Chain = defineChain({
  id: 130,
  name: "Unichain Mainnet",
  network: "Unichain Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://unichain-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://unichain-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://unichain-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const unichainSepolia: Chain = defineChain({
  id: 1301,
  name: "Unichain Sepolia",
  network: "Unichain Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://unichain-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://unichain-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://unichain-sepolia.g.alchemy.com/v2"],
    },
  },
});

export const soneiumMinato: Chain = defineChain({
  id: 1946,
  name: "Soneium Minato",
  network: "Soneium Minato",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://soneium-minato.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://soneium-minato.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://soneium-minato.g.alchemy.com/v2"],
    },
  },
});

export const soneiumMainnet: Chain = defineChain({
  id: 1868,
  name: "Soneium Mainnet",
  network: "Soneium Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://soneium-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://soneium-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://soneium-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const opbnbTestnet: Chain = defineChain({
  id: 5611,
  name: "OPBNB Testnet",
  network: "OPBNB Testnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://opbnb-testnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://opbnb-testnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://opbnb-testnet.g.alchemy.com/v2"],
    },
  },
});

export const opbnbMainnet: Chain = defineChain({
  id: 204,
  name: "OPBNB Mainnet",
  network: "OPBNB Mainnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://opbnb-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://opbnb-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://opbnb-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const beraChainBartio: Chain = defineChain({
  id: 80084,
  name: "BeraChain Bartio",
  network: "BeraChain Bartio",
  nativeCurrency: { name: "Bera", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://berachain-bartio.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://berachain-bartio.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://berachain-bartio.g.alchemy.com/v2"],
    },
  },
});

export const inkMainnet: Chain = defineChain({
  id: 57073,
  name: "Ink Mainnet",
  network: "Ink Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ink-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://ink-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://ink-mainnet.g.alchemy.com/v2"],
    },
  },
});

export const inkSepolia: Chain = defineChain({
  id: 763373,
  name: "Ink Sepolia",
  network: "Ink Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ink-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://ink-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://ink-sepolia.g.alchemy.com/v2"],
    },
  },
});

export const arbitrumNova: Chain = {
  ...vabn,
  rpcUrls: {
    ...vabn.rpcUrls,
  },
};

export const monadTestnet: Chain = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://monad-testnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://monad-testnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://monad-testnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const mekong: Chain = defineChain({
  id: 7078815900,
  name: "Mekong Pectra Devnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mekong.ethpandaops.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://explorer.mekong.ethpandaops.io",
    },
  },
  testnet: true,
});

export const openlootSepolia: Chain = defineChain({
  id: 905905,
  name: "Openloot Sepolia",
  nativeCurrency: { name: "Openloot", symbol: "OL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://openloot-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://openloot-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
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

export const gensynTestnet: Chain = defineChain({
  id: 685685,
  name: "Gensyn Testnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://gensyn-testnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://gensyn-testnet.g.alchemy.com/v2"],
    },
    alchemy: {
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

export const riseTestnet: Chain = defineChain({
  id: 11155931,
  name: "Rise Testnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rise-testnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://rise-testnet.g.alchemy.com/v2"],
    },
    alchemy: {
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

export const storyMainnet: Chain = defineChain({
  id: 1514,
  name: "Story Mainnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://story-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://story-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://story-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://www.storyscan.io",
    },
  },
  testnet: false,
});

export const storyAeneid: Chain = defineChain({
  id: 1315,
  name: "Story Aeneid",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://story-aeneid.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://story-aeneid.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://story-aeneid.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
});

export const celoAlfajores: Chain = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "Celo native asset", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://celo-alfajores.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://celo-alfajores.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://celo-alfajores.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://celo-alfajores.blockscout.com/",
    },
  },
  testnet: true,
});

export const celoMainnet: Chain = defineChain({
  id: 42220,
  name: "Celo Mainnet",
  nativeCurrency: { name: "Celo native asset", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://celo-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://celo-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://celo-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://celo.blockscout.com/",
    },
  },
  testnet: false,
});

export const teaSepolia: Chain = defineChain({
  id: 10218,
  name: "Tea Sepolia",
  nativeCurrency: { name: "TEA", symbol: "TEA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://tea-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://tea-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
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

export const bobaSepolia: Chain = defineChain({
  id: 28882,
  name: "Boba Sepolia",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://boba-sepolia.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://boba-sepolia.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://boba-sepolia.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://sepolia.testnet.bobascan.com/",
    },
  },
  testnet: true,
});

export const bobaMainnet: Chain = defineChain({
  id: 288,
  name: "Boba Mainnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://boba-mainnet.g.alchemy.com/v2"],
    },
    public: {
      http: ["https://boba-mainnet.g.alchemy.com/v2"],
    },
    alchemy: {
      http: ["https://boba-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://bobascan.com/",
    },
  },
  testnet: true,
});
