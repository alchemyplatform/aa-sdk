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

export interface SendVerificationCodeParams {
  type: "email" | "sms";
  contact: string;
}

export type UseSendVerificationCodeResult = {
  sendVerificationCode: UseMutateFunction<
    void,
    Error,
    SendVerificationCodeParams,
    unknown
  >;
  sendVerificationCodeAsync: UseMutateAsyncFunction<
    void,
    Error,
    SendVerificationCodeParams,
    unknown
  >;
  isSendingCode: boolean;
  error: Error | null;
};

export type UseSendVerificationCodeMutationArgs = BaseHookMutationArgs<
  void,
  SendVerificationCodeParams
>;

/**
 * A custom hook to send OTP verification codes to email or SMS for account verification.
 *
 * @param {UseSendVerificationCodeMutationArgs} [mutationArgs] Optional arguments for the mutation
 * @returns {UseSendVerificationCodeResult} An object containing functions and state for sending verification codes
 *
 * @example
 * ```ts twoslash
 * import { useSendVerificationCode } from "@account-kit/react";
 *
 * const {
 *   sendVerificationCode,
 *   isSendingCode,
 *   error
 * } = useSendVerificationCode({
 *   onSuccess: (data) => {
 *     console.log("OTP sent");
 *   },
 *   onError: (error) => console.error(error),
 * });
 *
 * // Send verification code to email
 * sendVerificationCode({
 *   type: "email",
 *   contact: "user@example.com"
 * });
 *
 * // Send verification code to SMS
 * sendVerificationCodeAsync({
 *   type: "sms",
 *   contact: "+1234567890"
 * });
 * ```
 */
export function useSendVerificationCode(
  mutationArgs?: UseSendVerificationCodeMutationArgs,
): UseSendVerificationCodeResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: sendVerificationCode,
    mutateAsync: sendVerificationCodeAsync,
    isPending: isSendingCode,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SendVerificationCodeParams) => {
        await signer!.sendVerificationCode(params.type, params.contact);
      },
      ...mutationArgs,
    },
    queryClient,
  );

  return {
    sendVerificationCode: ReactLogger.profiled(
      "sendVerificationCode",
      sendVerificationCode,
    ),
    sendVerificationCodeAsync: ReactLogger.profiled(
      "sendVerificationCodeAsync",
      sendVerificationCodeAsync,
    ),
    isSendingCode,
    error,
  };
}
