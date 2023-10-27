import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";

/**
 * Utility method returning the default light account factory address given a {@link chains.Chain} object
 *
 * @param chain - a {@link chains.Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactory = (chain: Chain): Address => {
  switch (chain.id) {
    case mainnet.id:
    case sepolia.id:
    case goerli.id:
    case polygon.id:
    case polygonMumbai.id:
    case optimism.id:
    case optimismGoerli.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case base.id:
    case baseGoerli.id:
      return "0x000000893A26168158fbeaDD9335Be5bC96592E2";
  }
  throw new Error("could not find light account factory address");
};
