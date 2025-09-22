"use client";

import type { MutateOptions } from "@tanstack/query-core";
import { QueryClient, useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi"; // TODO(jh): should we have an alchemy useConfig or always use wagmi's internally?
import {
  sendEmailOtp,
  type SendEmailOtpParameters,
  type SendEmailOtpReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import React from "react";

type SendEmailOtpMutate = (
  variables: SendEmailOtpParameters,
  options?:
    | MutateOptions<SendEmailOtpReturnType, Error, SendEmailOtpParameters>
    | undefined,
) => void;

type SendEmailOtpMutateAsync = (
  variables: SendEmailOtpParameters,
  options?:
    | MutateOptions<SendEmailOtpReturnType, Error, SendEmailOtpParameters>
    | undefined,
) => Promise<SendEmailOtpReturnType>;

export type UseSendEmailOtpParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        SendEmailOtpReturnType,
        Error,
        SendEmailOtpParameters
      >
    | undefined;
};

export type UseSendEmailOtpReturnType = UseMutationReturnType<
  SendEmailOtpReturnType,
  Error,
  SendEmailOtpParameters
> & {
  sendEmailOtp: SendEmailOtpMutate;
  sendEmailOtpAsync: SendEmailOtpMutateAsync;
};

/**
 * React hook for phase 1 of email OTP authentication - sends an OTP code to the user's email.
 *
 * This hook wraps the `sendEmailOtp` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for the email OTP flow.
 *
 * @param {UseSendEmailOtpParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSendEmailOtpReturnType} TanStack Query mutation object with the following properties:
 * - `sendEmailOtp`: `(variables: SendEmailOtpParameters, options?) => void` - Mutation function to send OTP email
 * - `sendEmailOtpAsync`: `(variables: SendEmailOtpParameters, options?) => Promise<SendEmailOtpReturnType>` - Async mutation function that returns a promise
 * - `data`: `SendEmailOtpReturnType | undefined` - The last successfully resolved data (void)
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
 * - `variables`: `SendEmailOtpParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSendEmailOtp } from '@alchemy/react';
 *
 * function LoginForm() {
 *   const { sendEmailOtp, isPending, error } = useSendEmailOtp();
 *
 *   const handleSendOtp = () => {
 *     sendEmailOtp({ email: 'user@example.com' });
 *   };
 *
 *   return (
 *     <button onClick={handleSendOtp} disabled={isPending}>
 *       {isPending ? 'Sending...' : 'Send OTP'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSendEmailOtp(
  parameters: UseSendEmailOtpParameters = {},
): UseSendEmailOtpReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    mutationKey: ["sendEmailOtp"],
    mutationFn: (variables) => {
      return sendEmailOtp(config, variables);
    },
  });

  return {
    ...result,
    sendEmailOtp: mutate,
    sendEmailOtpAsync: mutateAsync,
  };
}
