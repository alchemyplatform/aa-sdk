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
import { type Chain, type Hash, type Hex, type Transport } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendTransactionsMutationArgs<
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<Hash, SendTransactionsParameters<TAccount>>;

export type UseSendTransactionsArgs<
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  client:
    | UseSmartAccountClientResult<
        Transport,
        Chain | undefined,
        TAccount
      >["client"]
    | undefined;
} & UseSendTransactionsMutationArgs<TAccount>;

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

/**
 * @deprecated use useSendUserOperation instead
 *
 * Allows you to send a batch of transactions as a single user operation and await
 * the transaction to be mined.
 *
 * @param params - see {@link UseSendTransactionsArgs}
 * @returns a collection of functions and state for sending transactions {@link UseSendTransactionsResult}
 */
export function useSendTransactions<
  TAccount extends SupportedAccounts = SupportedAccounts,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  params: UseSendTransactionsArgs<TAccount>
): UseSendTransactionsResult<TAccount, TContext, TEntryPointVersion> {
  const { client, ...mutationArgs } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendTransactions,
    mutateAsync: sendTransactionsAsync,
    data: sendTransactionsResult,
    isPending: isSendingTransactions,
    error,
  } = useMutation(
    {
      mutationFn: async (
        sendTxParams: SendTransactionsParameters<
          TAccount,
          TContext,
          TEntryPointVersion
        >
      ) => {
        if (isConnected) {
          throw new UnsupportedEOAActionError(
            "useSendTransactions",
            "batch transactions"
          );
        }

        if (!client) {
          throw new ClientUndefinedHookError("useSendTransactions");
        }

        return client.sendTransactions(sendTxParams);
      },
      ...mutationArgs,
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
