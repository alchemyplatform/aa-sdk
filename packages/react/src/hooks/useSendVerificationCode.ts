"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type SendVerificationCodeParameters,
  type SendVerificationCodeReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  sendVerificationCodeMutationOptions,
  type SendVerificationCodeMutate,
  type SendVerificationCodeMutateAsync,
} from "../query/sendVerificationCode.js";

export type UseSendVerificationCodeParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        SendVerificationCodeReturnType,
        Error,
        SendVerificationCodeParameters
      >
    | undefined;
};

export type UseSendVerificationCodeReturnType = UseMutationReturnType<
  SendVerificationCodeReturnType,
  Error,
  SendVerificationCodeParameters
> & {
  sendVerificationCode: SendVerificationCodeMutate;
  sendVerificationCodeAsync: SendVerificationCodeMutateAsync;
};

/**
 * React hook for sending verification codes to email or phone.
 *
 * This hook initiates the verification process for updating email or phone number.
 * After sending the code, the user should submit it using useUpdateEmail or useUpdatePhoneNumber.
 *
 * @param {UseSendVerificationCodeParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseSendVerificationCodeReturnType} TanStack Query mutation object with sendVerificationCode functions
 *
 * @example
 * ```tsx twoslash
 * import { useSendVerificationCode } from '@alchemy/react';
 *
 * function UpdateEmailForm() {
 *   const { sendVerificationCode, isPending, isSuccess } = useSendVerificationCode();
 *
 *   const handleSendCode = () => {
 *     sendVerificationCode({
 *       contact: "newemail@example.com",
 *       type: "email"
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSendCode} disabled={isPending}>
 *         {isPending ? "Sending..." : "Send Code"}
 *       </button>
 *       {isSuccess && <p>Code sent! Check your email.</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSendVerificationCode(
  parameters: UseSendVerificationCodeParameters = {},
): UseSendVerificationCodeReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = sendVerificationCodeMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    sendVerificationCode: mutate,
    sendVerificationCodeAsync: mutateAsync,
  };
}
