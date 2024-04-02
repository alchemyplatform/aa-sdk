import { type Address, type Chain } from "viem";
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
  polygonAmoy,
  polygonMumbai,
  sepolia,
} from "../chains/index.js";
import { DefaultFactoryNotDefinedError } from "../errors/account.js";
import type { UserOperationFeeOptions } from "../types";

/**
 * Utility method returning the default simple account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultSimpleAccountFactoryAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    case mainnet.id:
    case polygon.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case base.id:
    case baseGoerli.id:
    case baseSepolia.id:
    case arbitrumSepolia.id:
      return "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232";
    case sepolia.id:
    case goerli.id:
    case polygonMumbai.id:
    case polygonAmoy.id:
    case optimismGoerli.id:
    case arbitrumGoerli.id:
      return "0x9406Cc6185a346906296840746125a0E44976454";
  }

  throw new DefaultFactoryNotDefinedError("SimpleAccount", chain);
};

export const minPriorityFeePerBidDefaults = new Map<number, bigint>([
  [arbitrum.id, 10_000_000n],
  [arbitrumGoerli.id, 10_000_000n],
  [arbitrumSepolia.id, 10_000_000n],
]);

export const getDefaultUserOperationFeeOptions = (
  chain: Chain
): UserOperationFeeOptions => {
  return {
    maxPriorityFeePerGas: {
      min: minPriorityFeePerBidDefaults.get(chain.id) ?? 100_000_000n,
      multiplier: 1.33,
    },
  };
};
