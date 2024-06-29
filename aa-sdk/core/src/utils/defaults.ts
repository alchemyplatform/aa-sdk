import { type Chain } from "viem";
import { arbitrum, arbitrumGoerli, arbitrumSepolia } from "viem/chains";
import type { UserOperationFeeOptions } from "../types.js";

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
