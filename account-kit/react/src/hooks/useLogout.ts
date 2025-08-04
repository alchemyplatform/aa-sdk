"use client";

import { disconnect } from "@account-kit/core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOptionalAuthContext } from "../components/auth/context.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { BaseHookMutationArgs } from "../types.js";

export type UseLogoutMutationArgs = BaseHookMutationArgs<void, void>;

export type UseLogoutResult = {
  logout: UseMutateFunction<void, Error, void, unknown>;
  isLoggingOut: boolean;
  error: Error | null;
};

/**
 * Provides a [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useLogout.ts) to log out a user, disconnecting the signer and triggering the disconnectAsync function.
 * This will disconnect both EVM and Solana wallets.
 *
 * @param {UseLogoutMutationArgs} [mutationArgs] optional arguments to customize the mutation behavior
 * @returns {UseLogoutResult} an object containing the logout function, a boolean indicating if logout is in progress, and any error encountered during logout
 *
 * @example
 * ```ts twoslash
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
 */
export function useLogout(
  mutationArgs?: UseLogoutMutationArgs,
): UseLogoutResult {
  const { queryClient, config } = useAlchemyAccountContext();
  const authContext = useOptionalAuthContext();
  const { disconnect: disconnectSolana } = useWallet();

  const {
    mutate: logout,
    isPending: isLoggingOut,
    error,
  } = useMutation(
    {
      mutationFn: async () => {
        // Disconnect from both EVM and Solana wallets
        await Promise.all([disconnect(config), disconnectSolana()]);
        authContext?.resetAuthStep();
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    logout,
    isLoggingOut,
    error,
  };
}
