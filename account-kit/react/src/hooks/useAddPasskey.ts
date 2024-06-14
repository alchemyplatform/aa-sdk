"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseAddPasskeyMutationArgs = BaseHookMutationArgs<
  string[],
  CredentialCreationOptions | undefined | void
>;

export type UseAddPasskeyResult = {
  addPasskey: UseMutateFunction<
    string[],
    Error,
    CredentialCreationOptions | undefined | void,
    unknown
  >;
  isAddingPasskey: boolean;
  error: Error | null;
};

export function useAddPasskey(
  mutationArgs?: UseAddPasskeyMutationArgs
): UseAddPasskeyResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: addPasskey,
    isPending: isAddingPasskey,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: CredentialCreationOptions | undefined | void
      ) => {
        return signer!.addPasskey(params ?? undefined);
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    addPasskey,
    isAddingPasskey,
    error,
  };
}
