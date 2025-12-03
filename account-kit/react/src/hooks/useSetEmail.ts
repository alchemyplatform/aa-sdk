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

export type SetEmailParams =
  | string // deprecated
  | {
      verificationCode: string;
    };

export type UseSetEmailMutationArgs = BaseHookMutationArgs<
  void,
  SetEmailParams
>;

export type UseSetEmailResult = {
  setEmail: UseMutateFunction<void, Error, SetEmailParams, unknown>;
  setEmailAsync: UseMutateAsyncFunction<void, Error, SetEmailParams, unknown>;
  isSettingEmail: boolean;
  error: Error | null;
};

/**
 * A custom hook to set an email address for an already authenticated account.
 *
 * **Note:** You should first use the `useSendVerificationCode` hook to send
 * a verification code to the email address before calling this hook.
 *
 * @param {UseSetEmailMutationArgs} [mutationArgs] Optional arguments for the setEmail mutation
 * @returns {UseSetEmailResult} An object containing functions and state for setting the email
 *
 * @example
 * ```ts twoslash
 * import { useSetEmail, useSendVerificationCode } from "@account-kit/react";
 *
 * // First, send verification code
 * const { sendVerificationCode } = useSendVerificationCode();
 *
 * const {
 *   setEmail,
 *   isSettingEmail,
 *   error
 * } = useSetEmail({
 *   onSuccess: () => {
 *     // do something when email is successfully set
 *   },
 *   onError: (error) => console.error(error),
 * });
 *
 * // Step 1: Send verification code to email
 * await sendVerificationCode({
 *   type: "email",
 *   contact: "user@example.com"
 * });
 *
 * // Step 2: Update email using verification code
 * setEmail({
 *   verificationCode: "123456" // code user received
 * });
 *
 * // DEPRECATED: Use with just email string (for backward compatibility)
 * setEmail("user@example.com");
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
      mutationFn: async (input: SetEmailParams) => {
        if (typeof input === "string") {
          // Backward compatibility: just email string
          await signer!.setEmail(input);
          queryClient.setQueryData(
            getListAuthMethodsQueryKey(user),
            (authMethods?: AuthMethods): AuthMethods | undefined =>
              authMethods && {
                ...authMethods,
                email: input,
              },
          );
        } else {
          // New OTP-based approach
          const email = await signer!.setEmail({
            verificationCode: input.verificationCode,
          });
          queryClient.setQueryData(
            getListAuthMethodsQueryKey(user),
            (authMethods?: AuthMethods): AuthMethods | undefined =>
              authMethods && {
                ...authMethods,
                email,
              },
          );
        }
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
