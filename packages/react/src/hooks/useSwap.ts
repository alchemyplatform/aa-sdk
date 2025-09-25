"use client";

import type { MutateOptions } from "@tanstack/query-core";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  swap,
  type SwapParameters,
  type SwapReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";

type SendEmailOtpMutate = (
  variables: SwapParameters,
  options?: MutateOptions<SwapReturnType, Error, SwapParameters> | undefined,
) => void;

type SendEmailOtpMutateAsync = (
  variables: SwapParameters,
  options?: MutateOptions<SwapReturnType, Error, SwapParameters> | undefined,
) => Promise<SwapReturnType>;

export type UseSwapParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<SwapReturnType, Error, SwapParameters>
    | undefined;
};

export type UseSwapReturnType = UseMutationReturnType<
  SwapReturnType,
  Error,
  SwapParameters
> & {
  swap: SendEmailOtpMutate;
  swapAsync: SendEmailOtpMutateAsync;
};

/**
 * React hook for executing token swaps.
 *
 * This hook wraps the `swap` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for token swaps.
 *
 * @param {UseSwapParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSwapReturnType} TanStack Query mutation object with the following properties:
 * - `swap`: `(variables: SwapParameters, options?) => void` - Mutation function to execute swap
 * - `swapAsync`: `(variables: SwapParameters, options?) => Promise<SwapReturnType>` - Async mutation function that returns a promise
 * - `data`: `SwapReturnType | undefined` - The last successfully resolved data from the swap
 * - `error`: `Error | null` - The error object for the mutation, if an error was encountered
 * - `isError`: `boolean` - True if the mutation is in an error state
 * - `isIdle`: `boolean` - True if the mutation is in its initial idle state
 * - `isPending`: `boolean` - True if the mutation is currently executing
 * - `isSuccess`: `boolean` - True if the last mutation attempt was successful
 * - `failureCount`: `number` - The failure count for the mutation
 * - `failureReason`: `Error | null` - The failure reason for the mutation retry
 * - `isPaused`: `boolean` - True if the mutation has been paused
 * - `reset`: `() => void` - Function to reset the mutation to its initial state
 * - `status`: `'idle' | 'pending' | 'error' | 'success'` - Current status of the mutation
 * - `submittedAt`: `number` - Timestamp for when the mutation was submitted
 * - `variables`: `SwapParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSwap } from '@alchemy/react';
 *
 * function SwapForm() {
 *   const { swap, isPending, error } = useSwap();
 *
 *   const handleSwap = () => {
 *     swap({
 *       // swap parameters here
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSwap} disabled={isPending}>
 *       {isPending ? 'Swapping...' : 'Execute Swap'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSwap(parameters: UseSwapParameters = {}): UseSwapReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    mutationKey: ["swap"],
    mutationFn: (variables) => {
      return swap(config, variables);
    },
  });

  return {
    ...result,
    swap: mutate,
    swapAsync: mutateAsync,
  };
}
