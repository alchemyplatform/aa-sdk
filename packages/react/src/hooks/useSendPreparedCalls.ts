"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type SendPreparedCallsParameters,
  type SendPreparedCallsReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  sendPreparedCallsMutationOptions,
  type SendPreparedCallsMutate,
  type SendPreparedCallsMutateAsync,
} from "../query/sendPreparedCalls.js";

export type UseSendPreparedCallsParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        SendPreparedCallsReturnType,
        Error,
        SendPreparedCallsParameters
      >
    | undefined;
};

export type UseSendPreparedCallsReturnType = UseMutationReturnType<
  SendPreparedCallsReturnType,
  Error,
  SendPreparedCallsParameters
> & {
  sendPreparedCalls: SendPreparedCallsMutate;
  sendPreparedCallsAsync: SendPreparedCallsMutateAsync;
};

/**
 * React hook for sending prepared calls.
 *
 * This hook wraps the `sendPreparedCalls` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for sending prepared calls.
 *
 * @param {UseSendPreparedCallsParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSendPreparedCallsReturnType} TanStack Query mutation object with the following properties:
 * - `sendPreparedCalls`: `(variables: SendPreparedCallsParameters, options?) => void` - Mutation function to send prepared calls
 * - `sendPreparedCallsAsync`: `(variables: SendPreparedCallsParameters, options?) => Promise<SendPreparedCallsReturnType>` - Async mutation function that returns a promise
 * - `data`: `SendPreparedCallsReturnType | undefined` - The last successfully resolved data from sending prepared calls
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
 * - `variables`: `SendPreparedCallsParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSendPreparedCalls } from '@alchemy/react';
 *
 * function SendCallsForm() {
 *   const { sendPreparedCalls, isPending, error } = useSendPreparedCalls();
 *
 *   const handleSendCalls = () => {
 *     sendPreparedCalls({
 *       // send prepared calls parameters here
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSendCalls} disabled={isPending}>
 *       {isPending ? 'Sending Calls...' : 'Send Calls'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSendPreparedCalls(
  parameters: UseSendPreparedCallsParameters = {},
): UseSendPreparedCallsReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = sendPreparedCallsMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    sendPreparedCalls: mutate,
    sendPreparedCallsAsync: mutateAsync,
  };
}
