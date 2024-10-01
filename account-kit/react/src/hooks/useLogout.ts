"use client";

import { disconnect } from "@account-kit/core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useOptionalAuthContext } from "../components/auth/context.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";

export type UseLogoutMutationArgs = BaseHookMutationArgs<void, void>;

export type UseLogoutResult = {
  logout: UseMutateFunction<void, Error, void, unknown>;
  isLoggingOut: boolean;
  error: Error | null;
};

/**
 * Provides a hook to log out a user, disconnecting the signer and triggering the disconnectAsync function.
 *
 * @example
 * ```ts
 * import { useLogout } from "@account-kit/react";
 *
 * const { logout, isLoggingOut, error } = useLogout({
 *  // these are optional
 *  onSuccess: () => {
 *   // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseLogoutMutationArgs} [mutationArgs] optional arguments to customize the mutation behavior
 * @returns {UseLogoutResult} an object containing the logout function, a boolean indicating if logout is in progress, and any error encountered during logout
 */
export function useLogout(
  mutationArgs?: UseLogoutMutationArgs
): UseLogoutResult {
  const { queryClient, config } = useAlchemyAccountContext();
  const authContext = useOptionalAuthContext();

  const {
    mutate: logout,
    isPending: isLoggingOut,
    error,
  } = useMutation(
    {
      mutationFn: async () => {
        await disconnect(config);
        authContext?.resetAuthStep();
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    logout,
    isLoggingOut,
    error,
  };
}
