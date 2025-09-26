"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type PrepareSwapParameters,
  type PrepareSwapReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  prepareSwapMutationOptions,
  type PrepareSwapMutate,
  type PrepareSwapMutateAsync,
} from "@alchemy/wagmi-core/query";

// TODO(jh): this should probably be a query to better align w/ wagmi?
// since usePrepareTransactionRequest, useEstimateFeesPerGas, useEstimateGas are all queries.
// it makes sense b/c it's fetching data and not mutating state in our db or on chain.

export type UsePrepareSwapParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<PrepareSwapReturnType, Error, PrepareSwapParameters>
    | undefined;
};

export type UsePrepareSwapReturnType = UseMutationReturnType<
  PrepareSwapReturnType,
  Error,
  PrepareSwapParameters
> & {
  prepareSwap: PrepareSwapMutate;
  prepareSwapAsync: PrepareSwapMutateAsync;
};

/**
 * React hook for preparing token swaps.
 *
 * This hook wraps the `prepareSwap` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for preparing token swaps.
 *
 * @param {UsePrepareSwapParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UsePrepareSwapReturnType} TanStack Query mutation object with the following properties:
 * - `prepareSwap`: `(variables: PrepareSwapParameters, options?) => void` - Mutation function to prepare swap
 * - `prepareSwapAsync`: `(variables: PrepareSwapParameters, options?) => Promise<PrepareSwapReturnType>` - Async mutation function that returns a promise
 * - `data`: `PrepareSwapReturnType | undefined` - The last successfully resolved data from the prepare swap
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
 * - `variables`: `PrepareSwapParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { usePrepareSwap } from '@alchemy/react';
 *
 * function SwapForm() {
 *   const { prepareSwap, isPending, error } = usePrepareSwap();
 *
 *   const handlePrepareSwap = () => {
 *     prepareSwap({
 *       // prepare swap parameters here
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handlePrepareSwap} disabled={isPending}>
 *       {isPending ? 'Preparing Swap...' : 'Prepare Swap'}
 *     </button>
 *   );
 * }
 * ```
 */
export function usePrepareSwap(
  parameters: UsePrepareSwapParameters = {},
): UsePrepareSwapReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = prepareSwapMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    prepareSwap: mutate as PrepareSwapMutate,
    prepareSwapAsync: mutateAsync as PrepareSwapMutateAsync,
  };
}
