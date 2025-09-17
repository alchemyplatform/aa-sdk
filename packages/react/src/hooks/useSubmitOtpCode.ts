"use client";

import type { MutateOptions } from "@tanstack/query-core";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi"; // TODO(jh): should we have an alchemy useConfig or always use wagmi's internally?
import {
  submitOtpCode,
  type SubmitOtpCodeParameters,
  type SubmitOtpCodeReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";

type SubmitOtpCodeMutate = (
  variables: SubmitOtpCodeParameters,
  options?:
    | MutateOptions<SubmitOtpCodeReturnType, Error, SubmitOtpCodeParameters>
    | undefined,
) => void;

type SubmitOtpCodeMutateAsync = (
  variables: SubmitOtpCodeParameters,
  options?:
    | MutateOptions<SubmitOtpCodeReturnType, Error, SubmitOtpCodeParameters>
    | undefined,
) => Promise<SubmitOtpCodeReturnType>;

export type UseSubmitOtpCodeParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        SubmitOtpCodeReturnType,
        Error,
        SubmitOtpCodeParameters
      >
    | undefined;
};

export type UseSubmitOtpCodeReturnType = UseMutationReturnType<
  SubmitOtpCodeReturnType,
  Error,
  SubmitOtpCodeParameters
> & {
  submitOtpCode: SubmitOtpCodeMutate;
  submitOtpCodeAsync: SubmitOtpCodeMutateAsync;
};

/**
 * React hook for phase 2 of email OTP authentication - submits the OTP code to complete authentication.
 *
 * This hook wraps the `submitOtpCode` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management. Upon successful submission,
 * the user will be authenticated and the wallet connection will be established.
 *
 * @param {UseSubmitOtpCodeParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSubmitOtpCodeReturnType} TanStack Query mutation object with the following properties:
 * - `submitOtpCode`: `(variables: SubmitOtpCodeParameters, options?) => void` - Mutation function to submit OTP code and complete authentication
 * - `submitOtpCodeAsync`: `(variables: SubmitOtpCodeParameters, options?) => Promise<SubmitOtpCodeReturnType>` - Async mutation function that returns a promise
 * - `data`: `SubmitOtpCodeReturnType | undefined` - The last successfully resolved data (void)
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
 * - `variables`: `SubmitOtpCodeParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useSubmitOtpCode } from '@alchemy/react';
 * import { useState } from 'react';
 *
 * function OtpVerificationForm() {
 *   const { submitOtpCode, isPending, error } = useSubmitOtpCode();
 *   const [otpCode, setOtpCode] = useState('');
 *
 *   const handleSubmit = () => {
 *     submitOtpCode({ otpCode });
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={otpCode}
 *         onChange={(e) => setOtpCode(e.target.value)}
 *         placeholder="Enter OTP code"
 *       />
 *       <button onClick={handleSubmit} disabled={isPending}>
 *         {isPending ? 'Verifying...' : 'Verify OTP'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSubmitOtpCode(
  parameters: UseSubmitOtpCodeParameters = {},
): UseSubmitOtpCodeReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    mutationKey: ["submitOtpCode"],
    mutationFn: (variables) => {
      return submitOtpCode(config, variables);
    },
  });

  return {
    ...result,
    submitOtpCode: mutate,
    submitOtpCodeAsync: mutateAsync,
  };
}
