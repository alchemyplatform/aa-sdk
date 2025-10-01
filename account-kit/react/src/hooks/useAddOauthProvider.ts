"use client";

import {
  useMutation,
  type UseMutateFunction,
  type UseMutateAsyncFunction,
} from "@tanstack/react-query";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";
import type {
  AuthMethods,
  AuthParams,
  OauthProviderInfo,
} from "@account-kit/signer";
import { ReactLogger } from "../metrics.js";
import { useUser } from "./useUser.js";
import { getListAuthMethodsQueryKey } from "./useListAuthMethods.js";

export type UseAddOauthProviderMutationArgs = BaseHookMutationArgs<
  OauthProviderInfo,
  Omit<Extract<AuthParams, { type: "oauth" }>, "type">
>;

export type UseAddOauthProviderResult = {
  addOauthProvider: UseMutateFunction<
    OauthProviderInfo,
    Error,
    Omit<Extract<AuthParams, { type: "oauth" }>, "type">,
    unknown
  >;
  addOauthProviderAsync: UseMutateAsyncFunction<
    OauthProviderInfo,
    Error,
    Omit<Extract<AuthParams, { type: "oauth" }>, "type">,
    unknown
  >;
  isAddingOauthProvider: boolean;
  error: Error | null;
};

/**
 * A custom hook to handle adding an OAuth provider to an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseAddOauthProviderMutationArgs} [mutationArgs] Optional arguments for the mutation used for adding an OAuth provider.
 * @returns {UseAddOauthProviderResult} An object containing the `addOauthProvider` function, `addOauthProviderAsync` for async execution, a boolean `isAddingOauthProvider` to track the mutation status, and any error encountered.
 *
 * @example
 * ```ts twoslash
 * import { useAddOauthProvider } from "@account-kit/react";
 *
 * const { addOauthProvider, isAddingOauthProvider, error } = useAddOauthProvider({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 */
export function useAddOauthProvider(
  mutationArgs?: UseAddOauthProviderMutationArgs,
): UseAddOauthProviderResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: addOauthProvider,
    mutateAsync: addOauthProviderAsync,
    isPending: isAddingOauthProvider,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: Omit<Extract<AuthParams, { type: "oauth" }>, "type">,
      ) => {
        const providerInfo = await signer!.addOauthProvider(params);
        queryClient.setQueryData(
          getListAuthMethodsQueryKey(user),
          (authMethods?: AuthMethods): AuthMethods | undefined =>
            authMethods && {
              ...authMethods,
              oauthProviders: [...authMethods.oauthProviders, providerInfo],
            },
        );
        return providerInfo;
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    addOauthProvider: ReactLogger.profiled(
      "addOauthProvider",
      addOauthProvider,
    ),
    addOauthProviderAsync: ReactLogger.profiled(
      "addOauthProviderAsync",
      addOauthProviderAsync,
    ),
    isAddingOauthProvider,
    error,
  };
}
