"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type SubmitSwapParameters,
  type SubmitSwapReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  submitSwapMutationOptions,
  type SubmitSwapMutate,
  type SubmitSwapMutateAsync,
} from "../query/submitSwap.js";

export type UseSubmitSubmitSwapParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<SubmitSwapReturnType, Error, SubmitSwapParameters>
    | undefined;
};

export type UseSubmitSubmitSwapReturnType = UseMutationReturnType<
  SubmitSwapReturnType,
  Error,
  SubmitSwapParameters
> & {
  submitSwap: SubmitSwapMutate;
  submitSwapAsync: SubmitSwapMutateAsync;
};

// TODO(v5): We may rename this hook (and its action) before launch. Silvia is thinking about it.
/**
 * React hook for submitting token swaps.
 *
 * This hook wraps the `submitSwap` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for submitting token swaps.
 *
 * @param {UseSubmitSubmitSwapParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSubmitSubmitSwapReturnType} TanStack Query mutation object with the following properties:
 * - `submitSwap`: `(variables: SubmitSwapParameters, options?) => void` - Mutation function to submit swap
 * - `submitSwapAsync`: `(variables: SubmitSwapParameters, options?) => Promise<SubmitSwapReturnType>` - Async mutation function that returns a promise
 * - `data`: `SubmitSwapReturnType | undefined` - The last successfully resolved data from the submit swap
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
 * - `variables`: `SubmitSwapParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSubmitSwap } from '@alchemy/react';
 *
 * function SwapForm() {
 *   const { submitSwap, isPending, error } = useSubmitSwap();
 *
 *   const handleSubmitSwap = () => {
 *     submitSwap({
 *       // submit swap parameters here
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSubmitSwap} disabled={isPending}>
 *       {isPending ? 'Submitting Swap...' : 'Submit Swap'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSubmitSwap(
  parameters: UseSubmitSubmitSwapParameters = {},
): UseSubmitSubmitSwapReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = submitSwapMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    submitSwap: mutate,
    submitSwapAsync: mutateAsync,
  };
}
