"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseAddPasskeyData = string[];

export type UseAddPasskeyParams = CredentialCreationOptions | undefined | void;

export type UseAddPasskeyMutationArgs = BaseHookMutationArgs<
  UseAddPasskeyData,
  CredentialCreationOptions | void
>;

export type UseAddPasskeyResult = {
  addPasskey: UseMutateFunction<
    UseAddPasskeyData,
    Error,
    UseAddPasskeyParams,
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
      mutationFn: async (params: UseAddPasskeyParams) => {
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
