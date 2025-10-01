import { type UserOperationFeeOptions } from "@aa-sdk/core";
import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  optimism,
  optimismGoerli,
  optimismSepolia,
} from "./chains.js";

/**
 * Retrieves the default user operation fee options for a given chain. Adjusts fees for specific chains like Arbitrum and Optimism.
 *
 * @example
 * ```ts
 * import { getDefaultUserOperationFeeOptions } from "@account-kit/infra";
 * import { arbitrum } from "@account-kit/infra";
 *
 * const feeOpts = getDefaultUserOperationFeeOptions(arbitrum);
 * ```
 *
 * @param {Chain} chain The blockchain chain for which to get the fee options
 * @returns {UserOperationFeeOptions} An object containing the default fee options for user operations on the specified chain
 */
export const getDefaultUserOperationFeeOptions = (
  chain: Chain,
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
