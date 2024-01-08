import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";

/**
 * Utility method returning the default multi owner msca factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultMultiOwnerMSCAFactoryAddress = (
  chain: Chain,
  excludeDefaultTokenReceiverPlugin: boolean = false
): Address => {
  switch (chain.id) {
    case mainnet.id:
    case sepolia.id:
    case goerli.id:
    case polygon.id:
    case polygonMumbai.id:
    case optimism.id:
    case optimismGoerli.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case arbitrumSepolia.id:
    case base.id:
    case baseGoerli.id:
    case baseSepolia.id:
      return excludeDefaultTokenReceiverPlugin
        ? "0xFD14c78640d72f73CC88238E2f7Df3273Ee84043" // MultiOwnerMSCAFactory
        : "0x22322E35c1850F26DD54Ed8F59a27C1c79847A15"; // MultiOwnerTokenReceiverMSCAFactory
  }
  throw new Error(
    `no default multi owner msca factory contract exists for ${chain.name}`
  );
};
