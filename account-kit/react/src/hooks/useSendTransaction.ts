"use client";

import type {
  SendTransactionParameters,
  SendTransactionReturnType,
} from "viem";

import { TransactionMissingToParamError } from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { sendTransaction as wagmi_sendTransaction } from "@wagmi/core";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendTransactionMutationArgs = BaseHookMutationArgs<
  SendTransactionReturnType,
  SendTransactionParameters
>;

export type UseSendTransactionArgs = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseSendTransactionMutationArgs;

export type UseSendTransactionResult = {
  sendTransaction: UseMutateFunction<
    SendTransactionReturnType,
    Error,
    SendTransactionParameters,
    unknown
  >;
  sendTransactionAsync: UseMutateAsyncFunction<
    SendTransactionReturnType,
    Error,
    SendTransactionParameters,
    unknown
  >;
  sendTransactionResult: SendTransactionReturnType | undefined;
  isSendingTransaction: boolean;
  error: Error | null;
};

/**
 * @deprecated use useSendUserOperation instead
 * Send a TX request as a user operation and wait for it to be mined
 *
 * @param params - see {@link UseSendUserOperationArgs}
 * @returns functions and state for sending txs {@link UseSendTransactionResult}
 */
export function useSendTransaction(
  params: UseSendTransactionArgs
): UseSendTransactionResult {
  const { client, ...mutationArgs } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendTransaction,
    mutateAsync: sendTransactionAsync,
    data: sendTransactionResult,
    isPending: isSendingTransaction,
    error,
  } = useMutation(
    {
      ...mutationArgs,
      mutationFn: async (params: SendTransactionParameters) => {
        if (isConnected) {
          const { to, ...txn } = params;
          if (to == null) {
            throw new TransactionMissingToParamError();
          }

          return wagmi_sendTransaction(wagmiConfig, {
            to,
            ...txn,
          });
        }

        if (!client) {
          throw new ClientUndefinedHookError("useSendTransaction");
        }

        return client.sendTransaction(params);
      },
    },
    queryClient
  );

  return {
    sendTransaction,
    sendTransactionAsync,
    sendTransactionResult,
    isSendingTransaction,
    error,
  };
}
