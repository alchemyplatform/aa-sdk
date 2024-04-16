import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  optimism,
  optimismGoerli,
  optimismSepolia,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import type { Chain } from "viem";

export const getDefaultUserOperationFeeOptions = (
  chain: Chain
): UserOperationFeeOptions => {
  const feeOptions: UserOperationFeeOptions = {
    maxFeePerGas: { multiplier: 1.5 },
    maxPriorityFeePerGas: { multiplier: 1.05 },
  };

  if (
    new Set<number>([
      arbitrum.id,
      arbitrumGoerli.id,
      arbitrumSepolia.id,
      optimism.id,
      optimismGoerli.id,
      optimismSepolia.id,
    ]).has(chain.id)
  ) {
    feeOptions.preVerificationGas = { multiplier: 1.05 };
  }

  return feeOptions;
};
