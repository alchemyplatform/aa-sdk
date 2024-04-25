"use client";

import type { WaitForUserOperationTxParameters } from "@alchemy/aa-core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { Hash } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseWaitForUserOperationTransactionMutationArgs =
  BaseHookMutationArgs<Hash, WaitForUserOperationTxParameters>;

export type UseWaitForUserOperationTransactionArgs = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseWaitForUserOperationTransactionMutationArgs;

export type UseWaitForUserOperationTransactionResult = {
  waitForUserOperationTransaction: UseMutateFunction<
    Hash,
    Error,
    WaitForUserOperationTxParameters,
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
      mutationFn: async (params: WaitForUserOperationTxParameters) => {
        if (!client) {
          throw new ClientUndefinedHookError(
            "useWaitForUserOperationTransaction"
          );
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
