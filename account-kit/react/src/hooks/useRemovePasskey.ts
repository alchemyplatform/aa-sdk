"use client";

import {
  useMutation,
  type UseMutateFunction,
  type UseMutateAsyncFunction,
} from "@tanstack/react-query";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";
import { ReactLogger } from "../metrics.js";
import { useUser } from "./useUser.js";
import { getListAuthMethodsQueryKey } from "./useListAuthMethods.js";
export type UseRemovePasskeyMutationArgs = BaseHookMutationArgs<void, string>;

export type UseRemovePasskeyResult = {
  removePasskey: UseMutateFunction<void, Error, string, unknown>;
  removePasskeyAsync: UseMutateAsyncFunction<void, Error, string, unknown>;
  isRemovingPasskey: boolean;
  error: Error | null;
};

/**
 * A custom [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAddPasskey.ts) to handle the addition of a passkey to an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseRemovePasskeyMutationArgs} [mutationArgs] Optional arguments for the mutation used for removing a passkey. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useRemovePasskey.ts#L8)
 * @returns {UseRemovePasskeyResult} An object containing the `removePasskey` function, `removePasskeyAsync` for async execution, a boolean `isRemovingPasskey` to track the mutation status, and any error encountered. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useRemovePasskey.ts#L13)
 *
 * @example
 * ```ts twoslash
 * import { useRemovePasskey } from "@account-kit/react";
 *
 * const { removePasskey, isRemovingPasskey, error } = useRemovePasskey({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 */
export function useRemovePasskey(
  mutationArgs?: UseRemovePasskeyMutationArgs,
): UseRemovePasskeyResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: removePasskey,
    mutateAsync: removePasskeyAsync,
    isPending: isRemovingPasskey,
    error,
  } = useMutation(
    {
      mutationFn: async (params: string) => {
        await signer!.removePasskey(params);
        queryClient.invalidateQueries({
          queryKey: getListAuthMethodsQueryKey(user),
        });
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    removePasskey: ReactLogger.profiled("removePasskey", removePasskey),
    removePasskeyAsync: ReactLogger.profiled(
      "removePasskeyAsync",
      removePasskeyAsync,
    ),
    isRemovingPasskey,
    error,
  };
}
