import type { UserOperationFeeOptions } from "@alchemy/aa-core";
import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  optimism,
  optimismGoerli,
  optimismSepolia,
} from "viem/chains";

export const getDefaultUserOperationFeeOptions = (
  chain: Chain
): UserOperationFeeOptions => {
  const feeOptions: UserOperationFeeOptions = {
    maxFeePerGas: { percentage: 50 },
    maxPriorityFeePerGas: { percentage: 5 },
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
    feeOptions.preVerificationGas = { percentage: 5 };
  }

  return feeOptions;
};
