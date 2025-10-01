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

export type UseSetEmailMutationArgs = BaseHookMutationArgs<void, string>;

export type UseSetEmailResult = {
  setEmail: UseMutateFunction<void, Error, string, unknown>;
  setEmailAsync: UseMutateAsyncFunction<void, Error, string, unknown>;
  isSettingEmail: boolean;
  error: Error | null;
};

/**
 * A custom hook to handle setting an email for an already authenticated account, which includes executing a mutation with optional parameters.
 *
 * @param {UseSetEmailMutationArgs} [mutationArgs] Optional arguments for the mutation used for setting an email.
 * @returns {UseSetEmailResult} An object containing the `setEmail` function, `setEmailAsync` for async execution, a boolean `isSettingEmail` to track the mutation status, and any error encountered.
 *
 * @example
 * ```ts twoslash
 * import { useSetEmail } from "@account-kit/react";
 *
 * const { setEmail, isSettingEmail, error } = useSetEmail({
 *  // these are optional
 *  onSuccess: () => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 */
export function useSetEmail(
  mutationArgs?: UseSetEmailMutationArgs,
): UseSetEmailResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const user = useUser();

  const {
    mutate: setEmail,
    mutateAsync: setEmailAsync,
    isPending: isSettingEmail,
    error,
  } = useMutation(
    {
      mutationFn: async (params: string) => {
        await signer!.setEmail(params);
        queryClient.setQueryData(
          getListAuthMethodsQueryKey(user),
          (authMethods?: AuthMethods): AuthMethods | undefined =>
            authMethods && {
              ...authMethods,
              email: params,
            },
        );
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    setEmail: ReactLogger.profiled("setEmail", setEmail),
    setEmailAsync: ReactLogger.profiled("setEmailAsync", setEmailAsync),
    isSettingEmail,
    error,
  };
}
