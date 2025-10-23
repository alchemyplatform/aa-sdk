"use client";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  type AddPasskeyParameters,
  type AddPasskeyReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";
import {
  addPasskeyMutationOptions,
  type AddPasskeyMutate,
  type AddPasskeyMutateAsync,
} from "../query/addPasskey.js";

export type UseAddPasskeyParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<AddPasskeyReturnType, Error, AddPasskeyParameters>
    | undefined;
};

export type UseAddPasskeyReturnType = UseMutationReturnType<
  AddPasskeyReturnType,
  Error,
  AddPasskeyParameters
> & {
  addPasskey: AddPasskeyMutate;
  addPasskeyAsync: AddPasskeyMutateAsync;
};

/**
 * React hook for adding a passkey to an already authenticated account.
 *
 * This hook uses the `addPasskey` mutation to add a passkey to the authenticated account.
 *
 * @param {UseAddPasskeyParameters} parameters - Configuration options for the hook
 * @returns {UseAddPasskeyReturnType} TanStack Query mutation object
 *
 * @example
 * ```tsx twoslash
 * import { useAddPasskey } from "@alchemy/react";
 *
 * function AddPasskeyForm() {
 *   const { addPasskey, isPending } = useAddPasskey();
 * }
 * ```
 */
export function useAddPasskey(
  parameters: UseAddPasskeyParameters = {},
): UseAddPasskeyReturnType {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  const mutationOptions = addPasskeyMutationOptions(config);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  return {
    ...result,
    addPasskey: mutate,
    addPasskeyAsync: mutateAsync,
  };
}
