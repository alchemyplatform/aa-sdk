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

export type UseRemoveOauthProviderMutationArgs = BaseHookMutationArgs<
  void,
  string
>;

export type UseRemoveOauthProviderResult = {
  removeOauthProvider: UseMutateFunction<void, Error, string, unknown>;
  removeOauthProviderAsync: UseMutateAsyncFunction<
    void,
    Error,
    string,
    unknown
  >;
  isRemovingOauthProvider: boolean;
  error: Error | null;
};

/**
 * A custom hook to handle removing an OAuth provider from an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseRemoveOauthProviderMutationArgs} [mutationArgs] Optional arguments for the mutation used for removing an OAuth provider.
 * @returns {UseRemoveOauthProviderResult} An object containing the `removeOauthProvider` function, `removeOauthProviderAsync` for async execution, a boolean `isRemovingOauthProvider` to track the mutation status, and any error encountered.
 *
 * @example
 * ```ts twoslash
 * import { useRemoveOauthProvider } from "@account-kit/react";
 *
 * const { removeOauthProvider, isRemovingOauthProvider, error } = useRemoveOauthProvider({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 */
export function useRemoveOauthProvider(
  mutationArgs?: UseRemoveOauthProviderMutationArgs,
): UseRemoveOauthProviderResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: removeOauthProvider,
    mutateAsync: removeOauthProviderAsync,
    isPending: isRemovingOauthProvider,
    error,
  } = useMutation(
    {
      mutationFn: async (providerId: string) => {
        await signer!.removeOauthProvider(providerId);
        queryClient.setQueryData(
          getListAuthMethodsQueryKey(user),
          (authMethods?: AuthMethods): AuthMethods | undefined =>
            authMethods && {
              ...authMethods,
              oauthProviders: authMethods.oauthProviders.filter(
                (provider) => provider.providerId !== providerId,
              ),
            },
        );
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    removeOauthProvider: ReactLogger.profiled(
      "removeOauthProvider",
      removeOauthProvider,
    ),
    removeOauthProviderAsync: ReactLogger.profiled(
      "removeOauthProviderAsync",
      removeOauthProviderAsync,
    ),
    isRemovingOauthProvider,
    error,
  };
}
