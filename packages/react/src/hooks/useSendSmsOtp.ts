"use client";

import type { MutateOptions } from "@tanstack/query-core";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  sendSmsOtp,
  type SendSmsOtpParameters,
  type SendSmsOtpReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";

type SendSmsOtpMutate = (
  variables: SendSmsOtpParameters,
  options?:
    | MutateOptions<SendSmsOtpReturnType, Error, SendSmsOtpParameters>
    | undefined,
) => void;

type SendSmsOtpMutateAsync = (
  variables: SendSmsOtpParameters,
  options?:
    | MutateOptions<SendSmsOtpReturnType, Error, SendSmsOtpParameters>
    | undefined,
) => Promise<SendSmsOtpReturnType>;

export type UseSendSmsOtpParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<SendSmsOtpReturnType, Error, SendSmsOtpParameters>
    | undefined;
};

export type UseSendSmsOtpReturnType = UseMutationReturnType<
  SendSmsOtpReturnType,
  Error,
  SendSmsOtpParameters
> & {
  sendSmsOtp: SendSmsOtpMutate;
  sendSmsOtpAsync: SendSmsOtpMutateAsync;
};

/**
 * React hook for phase 1 of SMS OTP authentication - sends an OTP code to the user's phone.
 *
 * This hook wraps the `sendSmsOtp` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for the SMS OTP flow.
 *
 * Phone number must include country code (e.g., "+12025551234").
 *
 * @param {UseSendSmsOtpParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSendSmsOtpReturnType} TanStack Query mutation object with the following properties:
 * - `sendSmsOtp`: `(variables: SendSmsOtpParameters, options?) => void` - Mutation function to send OTP SMS
 * - `sendSmsOtpAsync`: `(variables: SendSmsOtpParameters, options?) => Promise<SendSmsOtpReturnType>` - Async mutation function that returns a promise
 * - `data`: `SendSmsOtpReturnType | undefined` - The last successfully resolved data (void)
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
 * - `variables`: `SendSmsOtpParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSendSmsOtp } from '@alchemy/react';
 *
 * function LoginForm() {
 *   const { sendSmsOtp, isPending, error } = useSendSmsOtp();
 *
 *   const handleSendOtp = () => {
 *     sendSmsOtp({ phoneNumber: '+12025551234' });
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
export function useSendSmsOtp(
  parameters: UseSendSmsOtpParameters = {},
): UseSendSmsOtpReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    mutationKey: ["sendSmsOtp"],
    mutationFn: (variables) => {
      return sendSmsOtp(config, variables);
    },
  });

  return {
    ...result,
    sendSmsOtp: mutate,
    sendSmsOtpAsync: mutateAsync,
  };
}
