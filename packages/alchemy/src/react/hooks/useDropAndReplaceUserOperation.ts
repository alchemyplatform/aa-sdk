"use client";

import type {
  DropAndReplaceUserOperationParameters,
  GetEntryPointFromAccount,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { SupportedAccounts } from "../../config/types.js";
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
