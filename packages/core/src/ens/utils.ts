import type { Chain } from "viem/chains";
import * as chains from "viem/chains";
import { mainnet } from "../chains/index.js";

export const ChainsById: Map<number, chains.Chain> = new Map(
  Object.values(chains).map((x) => [x.id, x])
);

export const convertChainIdToCoinType = (chainId: number): number => {
  if (chainId === mainnet.id) {
    // this comes from [ensip-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution)
    return 60;
  }

  // this is using [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution) and assumes this is how mappings are stored for non mainnet chains
  return (0x80000000 | chainId) >>> 0;
};

export const convertCoinTypeToChainId = (coinType: number): number => {
  if (coinType === 60) {
    // this comes from [ensip-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution)
    return mainnet.id;
  }

  // this is using [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution) and assumes this is how mappings are stored for non mainnet chains
  return (0x7fffffff & coinType) >> 0;
};

export const convertCoinTypeToChain = (coinType: number): Chain => {
  const chainId = convertCoinTypeToChainId(coinType);
  const chain = ChainsById.get(chainId);
  if (!chain) {
    throw new Error("CoinType does not map to a supported chain");
  }

  return chain;
};
