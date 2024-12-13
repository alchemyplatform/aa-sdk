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
