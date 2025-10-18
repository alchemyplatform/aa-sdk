"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type UpdatePhoneNumberParameters,
  type UpdatePhoneNumberReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  updatePhoneNumberMutationOptions,
  type UpdatePhoneNumberMutate,
  type UpdatePhoneNumberMutateAsync,
} from "../query/updatePhoneNumber.js";

export type UseUpdatePhoneNumberParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        UpdatePhoneNumberReturnType,
        Error,
        UpdatePhoneNumberParameters
      >
    | undefined;
};

export type UseUpdatePhoneNumberReturnType = UseMutationReturnType<
  UpdatePhoneNumberReturnType,
  Error,
  UpdatePhoneNumberParameters
> & {
  updatePhoneNumber: UpdatePhoneNumberMutate;
  updatePhoneNumberAsync: UpdatePhoneNumberMutateAsync;
};

/**
 * React hook for updating or removing the user's phone number.
 *
 * To update: First call useSendVerificationCode with the new phone, then call this with the code.
 * To remove: Call this with `{ phoneNumber: null }`.
 *
 * @param {UseUpdatePhoneNumberParameters} parameters - Configuration options for the hook
 * @returns {UseUpdatePhoneNumberReturnType} TanStack Query mutation object
 *
 * @example
 * ```tsx twoslash
 * import { useUpdatePhoneNumber, useSendVerificationCode } from '@alchemy/react';
 *
 * function UpdatePhoneForm() {
 *   const { sendVerificationCode } = useSendVerificationCode();
 *   const { updatePhoneNumber, isPending } = useUpdatePhoneNumber();
 *
 *   const handleUpdate = async () => {
 *     await sendVerificationCode({ contact: "+15551234567", type: "phone" });
 *     const code = prompt("Enter code:");
 *     updatePhoneNumber({ verificationCode: code! });
 *   };
 *
 *   return <button onClick={handleUpdate}>Update Phone</button>;
 * }
 * ```
 */
export function useUpdatePhoneNumber(
  parameters: UseUpdatePhoneNumberParameters = {},
): UseUpdatePhoneNumberReturnType {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  const mutationOptions = updatePhoneNumberMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    updatePhoneNumber: mutate,
    updatePhoneNumberAsync: mutateAsync,
  };
}
