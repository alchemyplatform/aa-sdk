"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type LoginWithOauthParameters,
  type LoginWithOauthReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  loginWithOauthMutationOptions,
  type LoginWithOauthMutate,
  type LoginWithOauthMutateAsync,
} from "../query/loginWithOauth.js";

export type UseLoginWithOauthParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        LoginWithOauthReturnType,
        Error,
        LoginWithOauthParameters
      >
    | undefined;
};

export type UseLoginWithOauthReturnType = UseMutationReturnType<
  LoginWithOauthReturnType,
  Error,
  LoginWithOauthParameters
> & {
  loginWithOauth: LoginWithOauthMutate;
  loginWithOauthAsync: LoginWithOauthMutateAsync;
};

/**
 * React hook for OAuth authentication - initiates OAuth flow with the specified provider.
 *
 * This hook wraps the `loginWithOauth` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management for the OAuth authentication flow.
 *
 * @param {UseLoginWithOauthParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseLoginWithOauthReturnType} TanStack Query mutation object with the following properties:
 * - `loginWithOauth`: `(variables: LoginWithOauthParameters, options?) => void` - Mutation function to initiate OAuth login
 * - `loginWithOauthAsync`: `(variables: LoginWithOauthParameters, options?) => Promise<LoginWithOauthReturnType>` - Async mutation function that returns a promise
 * - `data`: `LoginWithOauthReturnType | undefined` - The last successfully resolved data (void)
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
 * - `variables`: `LoginWithOauthParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useLoginWithOauth } from '@alchemy/react';
 *
 * function LoginForm() {
 *   const { loginWithOauth, isPending, error } = useLoginWithOauth();
 *
 *   const handleGoogleLogin = () => {
 *     loginWithOauth({
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
export function useLoginWithOauth(
  parameters: UseLoginWithOauthParameters = {},
): UseLoginWithOauthReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = loginWithOauthMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    loginWithOauth: mutate,
    loginWithOauthAsync: mutateAsync,
  };
}
