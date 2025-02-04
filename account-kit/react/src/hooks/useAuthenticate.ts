"use client";

import { ClientOnlyPropertyError } from "@account-kit/core";
import type { AuthParams, User } from "@account-kit/signer";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import { ReactLogger } from "../metrics.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseAuthenticateMutationArgs = BaseHookMutationArgs<
  User,
  AuthParams
>;

export type UseAuthenticateResult = {
  authenticate: UseMutateFunction<User, Error, AuthParams, unknown>;
  authenticateAsync: UseMutateAsyncFunction<User, Error, AuthParams, unknown>;
  isPending: boolean;
  error: Error | null;
};

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAuthenticate.ts) that provides functions and state for authenticating a user using a signer. It includes methods for both synchronous and asynchronous mutations.
 * Useful if building your own UI components and want to control the authentication flow.
 * For authenticate vs authenticateAsync, use authenticate when you want the hook the handle state changes for you, authenticateAsync when you need to wait for the result to finish processing.
 *
 * This can be complex for magic link or OTP flows: OPT calls authenticate twice, but this should be handled by the signer.
 *
 * @example
 * ```ts
 * import { useAuthenticate } from "@account-kit/react";
 *
 * const { authenticate, authenticateAsync, isPending, error } = useAuthenticate({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseAuthenticateMutationArgs} [mutationArgs] Optional mutation arguments to configure the authentication mutation. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAuthenticate.ts#L15)
 * @returns {UseAuthenticateResult} An object containing functions and state for handling user authentication, including methods for synchronously and asynchronously executing the authentication. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAuthenticate.ts#L20)
 */
export function useAuthenticate(
  mutationArgs?: UseAuthenticateMutationArgs
): UseAuthenticateResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: authenticate,
    mutateAsync: authenticateAsync,
    isPending,
    error,
  } = useMutation(
    {
      mutationFn: async (authParams: AuthParams) => {
        if (!signer) {
          throw new ClientOnlyPropertyError("signer");
        }

        return signer.authenticate(authParams);
      },
      mutationKey: ["authenticate"],
      ...mutationArgs,
    },
    queryClient
  );

  return {
    authenticate: ReactLogger.profiled("authenticate", authenticate),
    authenticateAsync: ReactLogger.profiled(
      "authenticateAsync",
      authenticateAsync
    ),
    isPending,
    error,
  };
}
