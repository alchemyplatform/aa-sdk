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
import type { AuthMethods } from "@account-kit/signer";
import { getListAuthMethodsQueryKey } from "./useListAuthMethods.js";

export type UseRemoveEmailMutationArgs = BaseHookMutationArgs<void, void>;

export type UseRemoveEmailResult = {
  removeEmail: UseMutateFunction<void, Error, void, unknown>;
  removeEmailAsync: UseMutateAsyncFunction<void, Error, void, unknown>;
  isRemovingEmail: boolean;
  error: Error | null;
};

/**
 * A custom hook to handle the removal of an email from an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseRemoveEmailMutationArgs} [mutationArgs] Optional arguments for the mutation used for removing an email.
 * @returns {UseRemoveEmailResult} An object containing the `removeEmail` function, `removeEmailAsync` for async execution, a boolean `isRemovingEmail` to track the mutation status, and any error encountered.
 *
 * @example
 * ```ts twoslash
 * import { useRemoveEmail } from "@account-kit/react";
 *
 * const { removeEmail, isRemovingEmail, error } = useRemoveEmail({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 */
export function useRemoveEmail(
  mutationArgs?: UseRemoveEmailMutationArgs,
): UseRemoveEmailResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: removeEmail,
    mutateAsync: removeEmailAsync,
    isPending: isRemovingEmail,
    error,
  } = useMutation(
    {
      mutationFn: async () => {
        await signer!.removeEmail();
        queryClient.setQueryData(
          getListAuthMethodsQueryKey(user),
          (authMethods?: AuthMethods): AuthMethods | undefined =>
            authMethods && {
              ...authMethods,
              email: undefined,
            },
        );
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    removeEmail: ReactLogger.profiled("removeEmail", removeEmail),
    removeEmailAsync: ReactLogger.profiled(
      "removeEmailAsync",
      removeEmailAsync,
    ),
    isRemovingEmail,
    error,
  };
}
