"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

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

export function useAddPasskey(): UseAddPasskeyResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: addPasskey,
    isPending: isAddingPasskey,
    error,
  } = useMutation(
    {
      mutationFn: async (params?: CredentialCreationOptions | void) => {
        return signer!.addPasskey(params ?? undefined);
      },
    },
    queryClient
  );

  return {
    addPasskey,
    isAddingPasskey,
    error,
  };
}
