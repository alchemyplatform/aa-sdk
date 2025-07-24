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
  addPasskeyAsync: UseMutateAsyncFunction<
    string[],
    Error,
    CredentialCreationOptions | undefined | void,
    unknown
  >;
  isAddingPasskey: boolean;
  error: Error | null;
};

/**
 * A custom [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAddPasskey.ts) to handle the addition of a passkey to an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseAddPasskeyMutationArgs} [mutationArgs] Optional arguments for the mutation used for adding a passkey. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAddPasskey.ts#L8)
 * @returns {UseAddPasskeyResult} An object containing the `addPasskey` function, `addPasskeyAsync` for async execution, a boolean `isAddingPasskey` to track the mutation status, and any error encountered. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAddPasskey.ts#L13)
 *
 * @example
 * ```ts twoslash
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
 */
export function useAddPasskey(
  mutationArgs?: UseAddPasskeyMutationArgs,
): UseAddPasskeyResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: addPasskey,
    mutateAsync: addPasskeyAsync,
    isPending: isAddingPasskey,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: CredentialCreationOptions | undefined | void,
      ) => {
        const authenticatorIds = await signer!.addPasskey(params ?? undefined);
        queryClient.invalidateQueries({
          queryKey: getListAuthMethodsQueryKey(user),
        });
        return authenticatorIds;
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    addPasskey: ReactLogger.profiled("addPasskey", addPasskey),
    addPasskeyAsync: ReactLogger.profiled("addPasskeyAsync", addPasskeyAsync),
    isAddingPasskey,
    error,
  };
}
