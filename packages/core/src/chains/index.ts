import { defineChain, type Chain } from "viem";
import {
  arbitrum as vab,
  arbitrumGoerli as vabg,
  arbitrumSepolia as vabs,
  base as vbase,
  baseGoerli as vbaseg,
  baseSepolia as vbases,
  goerli as vgo,
  mainnet as vmain,
  optimism as vop,
  optimismGoerli as vopg,
  optimismSepolia as vops,
  polygon as vpg,
  polygonMumbai as vpgm,
  polygonAmoy as vpga,
  sepolia as vsep,
  fraxtal as vfrax,
  zora as vzora,
  zoraSepolia as vzoras,
} from "viem/chains";

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
