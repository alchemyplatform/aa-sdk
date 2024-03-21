import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
} from "@alchemy/aa-core";
import type { Address, Chain } from "viem";

/**
 * Utility method returning the default nani account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultNaniAccountFactoryAddress = (chain: Chain): Address => {
  switch (chain.id) {
    case mainnet.id:
    case sepolia.id:
    case base.id:
    case baseGoerli.id:
    case baseSepolia.id:
    case polygon.id:
    case polygonAmoy.id:
    case polygonMumbai.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case arbitrumSepolia.id:
    case optimism.id:
    case optimismGoerli.id:
    case optimismSepolia.id:
      return "0x000000000000dD366cc2E4432bB998e41DFD47C7";
  }
  throw new Error(
    `no default nani account factory contract exists for ${chain.name}`
  );
};
