import { type Address, type Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  zora,
  zoraSepolia,
} from "../chains/index.js";
import { defaultEntryPointVersion } from "../entrypoint/index.js";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { DefaultFactoryNotDefinedError } from "../errors/account.js";
import type { UserOperationFeeOptions } from "../types";

/**
 * Utility method returning the default simple account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @param version - {@link EntryPointVersion} value that defaults to `defaultEntryPointVersion`
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultSimpleAccountFactoryAddress = (
  chain: Chain,
  version: EntryPointVersion = defaultEntryPointVersion
): Address => {
  switch (version) {
    case "0.6.0":
      switch (chain.id) {
        case mainnet.id:
        case polygon.id:
        case polygonAmoy.id:
        case optimism.id:
        case optimismSepolia.id:
        case arbitrum.id:
        case arbitrumSepolia.id:
        case base.id:
        case baseGoerli.id:
        case baseSepolia.id:
        case fraxtal.id:
        case fraxtalSepolia.id:
        case zora.id:
        case zoraSepolia.id:
          return "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232";
        case sepolia.id:
        case goerli.id:
        case polygonMumbai.id:
        case optimismGoerli.id:
        case arbitrumGoerli.id:
          return "0x9406Cc6185a346906296840746125a0E44976454";
        default:
          break;
      }
      break;
    case "0.7.0":
      switch (chain.id) {
        default:
          return "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985";
      }
  }

  throw new DefaultFactoryNotDefinedError("SimpleAccount", chain, version);
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
