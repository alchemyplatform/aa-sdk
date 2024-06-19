"use client";

import type { SupportedAccounts } from "@account-kit/core";
import type {
  DropAndReplaceUserOperationParameters,
  GetEntryPointFromAccount,
  SendUserOperationResult,
} from "@aa-sdk/core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseDropAndReplaceUserOperationMutationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<
  SendUserOperationResult<TEntryPointVersion>,
  DropAndReplaceUserOperationParameters<TAccount>
>;

export type UseDropAndReplaceUserOperationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseDropAndReplaceUserOperationMutationArgs<TEntryPointVersion, TAccount>;

export type UseDropAndReplaceUserOperationResult<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  dropAndReplaceUserOperation: UseMutateFunction<
    SendUserOperationResult<TEntryPointVersion>,
    Error,
    DropAndReplaceUserOperationParameters<TAccount>,
    unknown
  >;
  dropAndReplaceUserOperationResult:
    | SendUserOperationResult<TEntryPointVersion>
    | undefined;
  isDroppingAndReplacingUserOperation: boolean;
  error: Error | null;
};

/**
 * Custom hook that handles the drop and replace user operation for a given client and mutation arguments.
 *
 * @example
 * ```ts
 * import { useDropAndReplaceUserOperation } from "@account-kit/react";
 *
 * const { dropAndReplaceUserOperation, dropAndReplaceUserOperationResult, isDroppingAndReplacingUserOperation, error } = useDropAndReplaceUserOperation({
 *  client,
 *  // these are optional
 *  onSuccess: (result) => {
 *   // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseDropAndReplaceUserOperationArgs<TEntryPointVersion, TAccount>} config The configuration parameters including the client and other mutation arguments
 * @returns {UseDropAndReplaceUserOperationResult<TEntryPointVersion, TAccount>} The result containing the mutation function, result data, loading state, and any error
 */
export function useDropAndReplaceUserOperation<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>({
  client,
  ...mutationArgs
}: UseDropAndReplaceUserOperationArgs<
  TEntryPointVersion,
  TAccount
>): UseDropAndReplaceUserOperationResult<TEntryPointVersion, TAccount> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: dropAndReplaceUserOperation,
    data: dropAndReplaceUserOperationResult,
    isPending: isDroppingAndReplacingUserOperation,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: DropAndReplaceUserOperationParameters<TAccount>
      ) => {
        if (!client) {
          throw new ClientUndefinedHookError("useDropAndReplaceUserOperation");
        }

        return client.dropAndReplaceUserOperation(params);
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    dropAndReplaceUserOperation,
    dropAndReplaceUserOperationResult,
    isDroppingAndReplacingUserOperation,
    error,
  };
}
