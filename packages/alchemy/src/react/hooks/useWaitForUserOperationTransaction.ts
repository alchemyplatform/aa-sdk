"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { Hash, WaitForTransactionReceiptParameters } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseWaitForUserOperationTransactionMutationArgs =
  BaseHookMutationArgs<Hash, WaitForTransactionReceiptParameters>;

export type UseWaitForUserOperationTransactionArgs = {
  client?: UseSmartAccountClientResult["client"];
} & UseWaitForUserOperationTransactionMutationArgs;

export type UseWaitForUserOperationTransactionResult = {
  waitForUserOperationTransaction: UseMutateFunction<
    Hash,
    Error,
    WaitForTransactionReceiptParameters,
    unknown
  >;
  waitForUserOperationTransactionResult: Hash | undefined;
  isWaitingForUserOperationTransaction: boolean;
  error: Error | null;
};

export function useWaitForUserOperationTransaction({
  client,
}: UseWaitForUserOperationTransactionArgs): UseWaitForUserOperationTransactionResult {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: waitForUserOperationTransaction,
    data: waitForUserOperationTransactionResult,
    isPending: isWaitingForUserOperationTransaction,
    error,
  } = useMutation(
    {
      mutationFn: async (params: WaitForTransactionReceiptParameters) => {
        if (!client) {
          throw new ClientUndefinedError("useWaitForUserOperationTransaction");
        }

        return client.waitForUserOperationTransaction(params);
      },
    },
    queryClient
  );

  return {
    waitForUserOperationTransaction,
    waitForUserOperationTransactionResult,
    isWaitingForUserOperationTransaction,
    error,
  };
}
