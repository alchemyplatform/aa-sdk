"use client";

import type {
  DefaultEntryPointVersion,
  DropAndReplaceUserOperationParameters,
  EntryPointVersion,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { ClientUndefinedError } from "../errors.js";

export type UseDropAndReplaceUserOperationMutationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = BaseHookMutationArgs<
  SendUserOperationResult<TEntryPointVersion>,
  DropAndReplaceUserOperationParameters<TAccount>
>;

export type UseDropAndReplaceUserOperationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseDropAndReplaceUserOperationMutationArgs<TAccount, TEntryPointVersion>;

export type UseDropAndReplaceUserOperationResult<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
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
  TAccount extends SupportedAccounts = SupportedAccounts,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
>({
  client,
  ...mutationArgs
}: UseDropAndReplaceUserOperationArgs<
  TAccount,
  TEntryPointVersion
>): UseDropAndReplaceUserOperationResult<TAccount, TEntryPointVersion> {
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
          throw new ClientUndefinedError("useDropAndReplaceUserOperation");
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
