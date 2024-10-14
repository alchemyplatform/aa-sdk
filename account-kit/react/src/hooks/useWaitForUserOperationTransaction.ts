"use client";

import type { WaitForUserOperationTxParameters } from "@aa-sdk/core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { Hash } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import { ReactLogger } from "../metrics.js";
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

/**
 * Custom hook to wait for a user operation transaction and manage its state (pending, error, result).
 *
 * @example
 * ```ts
 * import { useWaitForUserOperationTransaction, useSmartAccountClient } from "@account-kit/react";
 *
 * const { client } = useSmartAccountClient({ type: "LightAccount" });
 * const {
 *  waitForUserOperationTransaction,
 *  waitForUserOperationTransactionResult,
 *  isWaitingForUserOperationTransaction,
 *  error
 * } = useWaitForUserOperationTransaction({
 *  client,
 *  // these are optional
 *  onSuccess: (result) => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseWaitForUserOperationTransactionArgs} config Configuration object containing the client
 * @returns {UseWaitForUserOperationTransactionResult} An object containing methods and state related to waiting for a user operation transaction
 */
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
    waitForUserOperationTransaction: ReactLogger.profiled(
      "waitForUserOperationTransaction",
      waitForUserOperationTransaction
    ),
    waitForUserOperationTransactionResult,
    isWaitingForUserOperationTransaction,
    error,
  };
}
