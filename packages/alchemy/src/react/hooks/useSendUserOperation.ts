"use client";

import type {
  DefaultEntryPointVersion,
  EntryPointVersion,
  SendUserOperationParameters,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { Hash } from "viem";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendUserOperationMutationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<Hash, SendUserOperationParameters<TAccount>>;

export type UseSendUserOperationArgs = {
  client?: UseSmartAccountClientResult["client"];
} & UseSendUserOperationMutationArgs;

export type UseSendUserOperationResult<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = {
  sendUserOperation: UseMutateFunction<
    SendUserOperationResult<TEntryPointVersion>,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationAsync: UseMutateAsyncFunction<
    SendUserOperationResult<TEntryPointVersion>,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationResult:
    | SendUserOperationResult<TEntryPointVersion>
    | undefined;
  isSendingUserOperation: boolean;
  error: Error | null;
};

export function useSendUserOperation<
  TAccount extends SupportedAccounts = SupportedAccounts
>({ client }: UseSendUserOperationArgs): UseSendUserOperationResult<TAccount> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: sendUserOperation,
    mutateAsync: sendUserOperationAsync,
    data: sendUserOperationResult,
    isPending: isSendingUserOperation,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SendUserOperationParameters<TAccount>) => {
        if (!client) {
          throw new ClientUndefinedError("useSendUserOperation");
        }

        return client.sendUserOperation(params);
      },
    },
    queryClient
  );

  return {
    sendUserOperation,
    sendUserOperationAsync,
    sendUserOperationResult,
    isSendingUserOperation,
    error,
  };
}
