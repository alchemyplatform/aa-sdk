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
import type { UseSendUserOperationArgs } from "./useSendUserOperation.js";

export type UseDropAndReplaceUserOperationArgs = UseSendUserOperationArgs;

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
}: UseDropAndReplaceUserOperationArgs): UseDropAndReplaceUserOperationResult<
  TAccount,
  TEntryPointVersion
> {
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
          throw new Error("client must be defined");
        }

        return client.dropAndReplaceUserOperation(params);
      },
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
