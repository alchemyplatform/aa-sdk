"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type UpdateEmailParameters,
  type UpdateEmailReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  updateEmailMutationOptions,
  type UpdateEmailMutate,
  type UpdateEmailMutateAsync,
} from "../query/updateEmail.js";

export type UseUpdateEmailParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<UpdateEmailReturnType, Error, UpdateEmailParameters>
    | undefined;
};

export type UseUpdateEmailReturnType = UseMutationReturnType<
  UpdateEmailReturnType,
  Error,
  UpdateEmailParameters
> & {
  updateEmail: UpdateEmailMutate;
  updateEmailAsync: UpdateEmailMutateAsync;
};

/**
 * React hook for updating or removing the user's email address.
 *
 * To update: First call useSendVerificationCode with the new email, then call this with the code.
 * To remove: Call this with { email: null }.
 *
 * @param {UseUpdateEmailParameters} parameters - Configuration options for the hook
 * @returns {UseUpdateEmailReturnType} TanStack Query mutation object
 *
 * @example
 * ```tsx twoslash
 * import { useUpdateEmail, useSendVerificationCode } from '@alchemy/react';
 *
 * function UpdateEmailForm() {
 *   const { sendVerificationCode } = useSendVerificationCode();
 *   const { updateEmail, isPending } = useUpdateEmail();
 *
 *   const handleUpdate = async () => {
 *     await sendVerificationCode({ contact: "new@example.com", type: "email" });
 *     const code = prompt("Enter code:");
 *     updateEmail({ verificationCode: code! });
 *   };
 *
 *   const handleRemove = () => {
 *     updateEmail({ email: null });
 *   };
 *
 *   return <button onClick={handleUpdate}>Update Email</button>;
 * }
 * ```
 */
export function useUpdateEmail(
  parameters: UseUpdateEmailParameters = {},
): UseUpdateEmailReturnType {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  const mutationOptions = updateEmailMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    updateEmail: mutate,
    updateEmailAsync: mutateAsync,
  };
}
