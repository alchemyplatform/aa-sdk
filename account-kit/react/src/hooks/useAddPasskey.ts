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

/**
 * A custom hook to handle the addition of a passkey, which includes executing a mutation with optional parameters.
 *
 * @example
 * ```ts
 * import { useAddPasskey } from "@account-kit/react";
 *
 * const { addPasskey, isAddingPasskey, error } = useAddPasskey({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseAddPasskeyMutationArgs} [mutationArgs] Optional arguments for the mutation used for adding a passkey
 * @returns {UseAddPasskeyResult} An object containing the `addPasskey` function, a boolean `isAddingPasskey` to track the mutation status, and any error encountered
 */
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
