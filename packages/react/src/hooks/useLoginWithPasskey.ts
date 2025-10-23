"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type LoginWithPasskeyParameters,
  type LoginWithPasskeyReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  loginWithPasskeyMutationOptions,
  type LoginWithPasskeyMutate,
  type LoginWithPasskeyMutateAsync,
} from "../query/loginWithPasskey.js";

export type UseLoginWithPasskeyParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        LoginWithPasskeyReturnType,
        Error,
        LoginWithPasskeyParameters
      >
    | undefined;
};

export type UseLoginWithPasskeyReturnType = UseMutationReturnType<
  LoginWithPasskeyReturnType,
  Error,
  LoginWithPasskeyParameters
> & {
  loginWithPasskey: LoginWithPasskeyMutate;
  loginWithPasskeyAsync: LoginWithPasskeyMutateAsync;
};

/**
 * React hook for Passkey authentication - initiates authentication flow with the specified options.
 *
 * This hook wraps the `loginWithPasskey` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for the OAuth authentication flow.
 *
 * @param {UseLoginWithPasskeyParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseLoginWithPasskeyReturnType} TanStack Query mutation object with the following properties:
 * - `loginWithPasskey`: `(variables: LoginWithPasskeyParameters, options?) => void` - Mutation function to initiate OAuth login
 * - `loginWithPasskeyAsync`: `(variables: LoginWithPasskeyParameters, options?) => Promise<LoginWithPasskeyReturnType>` - Async mutation function that returns a promise
 * - `data`: `LoginWithPasskeyReturnType | undefined` - The last successfully resolved data (void)
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
 * - `variables`: `LoginWithPasskeyParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useLoginWithPasskey } from '@alchemy/react';
 *
 * function LoginForm() {
 *   const { loginWithPasskey, isPending, error } = useLoginWithPasskey();
 *
 *   const handleGoogleLogin = () => {
 *     loginWithPasskey({
 *       provider: 'google',
 *       mode: 'popup' // or 'redirect'
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleGoogleLogin} disabled={isPending}>
 *       {isPending ? 'Logging in...' : 'Login with Google'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useLoginWithPasskey(
  parameters: UseLoginWithPasskeyParameters = {},
): UseLoginWithPasskeyReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = loginWithPasskeyMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    loginWithPasskey: mutate,
    loginWithPasskeyAsync: mutateAsync,
  };
}
