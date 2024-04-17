"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
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
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: logout,
    isPending: isLoggingOut,
    error,
  } = useMutation(
    {
      mutationFn: signer!.disconnect,
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
