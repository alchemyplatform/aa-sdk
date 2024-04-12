"use client";

import type {
  SendUserOperationParameters,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSendUserOperationArgs = {
  client?: UseSmartAccountClientResult["client"];
};

export type UseSendUserOperationResult<
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  sendUserOperation: UseMutateFunction<
    SendUserOperationResult,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationResult: SendUserOperationResult | undefined;
  isSendingUserOperation: boolean;
  error: Error | null;
};

export function useSendUserOperation<
  TAccount extends SupportedAccounts = SupportedAccounts
>({ client }: UseSendUserOperationArgs): UseSendUserOperationResult<TAccount> {
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
          throw new Error("client must be defined");
        }

        return client.sendUserOperation(params);
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
