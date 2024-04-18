"use client";

import {
  type GetEntryPointFromAccount,
  type SendTransactionsParameters,
  type UserOperationContext,
} from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { type Hash, type Hex } from "viem";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendTransactionsMutationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<Hash, SendTransactionsParameters<TAccount>>;

export type UseSendTransactionsArgs = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseSendTransactionsMutationArgs;

export type UseSendTransactionsResult<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  sendTransactions: UseMutateFunction<
    Hex,
    Error,
    SendTransactionsParameters<TAccount, TContext, TEntryPointVersion>,
    unknown
  >;
  sendTransactionsAsync: UseMutateAsyncFunction<
    Hex,
    Error,
    SendTransactionsParameters<TAccount, TContext, TEntryPointVersion>,
    unknown
  >;
  sendTransactionsResult: Hex | undefined;
  isSendingTransactions: boolean;
  error: Error | null;
};

export function useSendTransactions<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>({
  client,
}: UseSendTransactionsArgs): UseSendTransactionsResult<
  TAccount,
  TContext,
  TEntryPointVersion
> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: sendTransactions,
    mutateAsync: sendTransactionsAsync,
    data: sendTransactionsResult,
    isPending: isSendingTransactions,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: SendTransactionsParameters<
          TAccount,
          TContext,
          TEntryPointVersion
        >
      ) => {
        if (!client) {
          throw new ClientUndefinedHookError("useSendTransactions");
        }

        return client.sendTransactions(params);
      },
    },
    queryClient
  );

  return {
    sendTransactions,
    sendTransactionsAsync,
    sendTransactionsResult,
    isSendingTransactions,
    error,
  };
}
