"use client";

import type { SendTransactionsParameters } from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { Hash, Hex } from "viem";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendTransactionsMutationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<Hash, SendTransactionsParameters<TAccount>>;

export type UseSendTransactionsArgs = {
  client?: UseSmartAccountClientResult["client"];
} & UseSendTransactionsMutationArgs;

export type UseSendTransactionsResult<
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  sendTransactions: UseMutateFunction<
    Hex,
    Error,
    SendTransactionsParameters<TAccount>,
    unknown
  >;
  sendTransactionsAsync: UseMutateAsyncFunction<
    Hex,
    Error,
    SendTransactionsParameters<TAccount>,
    unknown
  >;
  sendTransactionsResult: Hex | undefined;
  isSendingTransactions: boolean;
  error: Error | null;
};

export function useSendTransactions<
  TAccount extends SupportedAccounts = SupportedAccounts
>({ client }: UseSendTransactionsArgs): UseSendTransactionsResult<TAccount> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: sendTransactions,
    mutateAsync: sendTransactionsAsync,
    data: sendTransactionsResult,
    isPending: isSendingTransactions,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SendTransactionsParameters<TAccount>) => {
        if (!client) {
          throw new ClientUndefinedError("useSendTransactions");
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
