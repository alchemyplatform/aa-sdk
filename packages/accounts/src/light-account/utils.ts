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
 * Utility method returning the default light account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactoryAddress = (chain: Chain): Address => {
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
      return "0x00000055C0b4fA41dde26A74435ff03692292FBD";
  }
  throw new Error(
    `no default light account factory contract exists for ${chain.name}`
  );
};
