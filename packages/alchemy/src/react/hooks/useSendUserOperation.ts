"use client";

import type {
  GetEntryPointFromAccount,
  SendUserOperationParameters,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendUserOperationMutationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<
  SendUserOperationResult<TEntryPointVersion>,
  SendUserOperationParameters<TAccount>
>;

export type UseSendUserOperationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  client: UseSmartAccountClientResult["client"] | undefined;
  waitForTxn?: boolean;
} & UseSendUserOperationMutationArgs<TEntryPointVersion, TAccount>;

export type UseSendUserOperationResult<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
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
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>({
  client,
  waitForTxn = false,
  ...mutationArgs
}: UseSendUserOperationArgs<
  TEntryPointVersion,
  TAccount
>): UseSendUserOperationResult<TEntryPointVersion, TAccount> {
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

        if (!waitForTxn) {
          return client.sendUserOperation(params);
        }

        const { hash, request } = await client.sendUserOperation(params);
        const txnHash = await client.waitForUserOperationTransaction({ hash });

        return {
          hash: txnHash,
          request,
        };
      },
      ...mutationArgs,
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
