"use client";

import type { SendUserOperationParameters } from "@alchemy/aa-core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
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
  waitForTxn?: boolean;
} & UseSendUserOperationMutationArgs;

export type UseSendUserOperationResult<
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  sendUserOperation: UseMutateFunction<
    Hash,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationResult: Hash | undefined;
  isSendingUserOperation: boolean;
  error: Error | null;
};

export function useSendUserOperation<
  TAccount extends SupportedAccounts = SupportedAccounts
>({
  client,
  waitForTxn,
}: UseSendUserOperationArgs): UseSendUserOperationResult<TAccount> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: sendUserOperation,
    data: sendUserOperationResult,
    isPending: isSendingUserOperation,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SendUserOperationParameters<TAccount>) => {
        if (!client) {
          throw new ClientUndefinedError("useSendUserOperation");
        }

        const { hash } = await client.sendUserOperation(params);

        if (!waitForTxn) {
          return hash;
        }

        return client.waitForUserOperationTransaction({ hash });
      },
    },
    queryClient
  );

  return {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error,
  };
}
