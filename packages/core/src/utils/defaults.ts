import { type Address, type Chain } from "viem";
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
 * Utility method returning the entry point contrafct address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultEntryPointAddress = (chain: Chain): Address => {
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
      return "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  }
  throw new Error(
    `no default entrypoint contract address exists for ${chain.name}`
  );
};

/**
 * Utility method returning the default simple account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultSimpleAccountFactoryAddressAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    case mainnet.id:
    case polygon.id:
    case optimism.id:
    case arbitrum.id:
    case base.id:
    case baseGoerli.id:
      return "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232";
    case sepolia.id:
    case goerli.id:
    case polygonMumbai.id:
    case optimismGoerli.id:
    case arbitrumGoerli.id:
      return "0x9406Cc6185a346906296840746125a0E44976454";
  }

  throw new Error(
    `no default simple account factory contract exists for ${chain.name}`
  );
};
