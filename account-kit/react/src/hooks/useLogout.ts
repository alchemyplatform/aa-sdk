"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useDisconnect } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseLogoutMutationArgs = BaseHookMutationArgs<void, void>;

export type UseLogoutResult = {
  logout: UseMutateFunction<void, Error, void, unknown>;
  isLoggingOut: boolean;
  error: Error | null;
};

export function useLogout(
  mutationArgs?: UseLogoutMutationArgs
): UseLogoutResult {
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const signer = useSigner();
  const { disconnectAsync } = useDisconnect({ config: wagmiConfig });

  const {
    mutate: logout,
    isPending: isLoggingOut,
    error,
  } = useMutation(
    {
      mutationFn: async () => {
        await disconnectAsync();
        return signer?.disconnect();
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
