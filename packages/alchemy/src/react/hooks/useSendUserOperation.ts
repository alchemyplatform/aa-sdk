"use client";

import type {
  EntryPointVersion,
  GetEntryPointFromAccount,
  SendUserOperationParameters,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import { WaitForUserOperationError } from "@alchemy/aa-core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { sendTransaction as wagmi_sendTransaction } from "@wagmi/core";
import type { Hex } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import type { SupportedAccounts } from "../../config/types.js";
import { useAlchemyAccountContext } from "../context.js";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type SendUserOperationWithEOA<
  TEntryPointVersion extends EntryPointVersion
> =
  | SendUserOperationResult<TEntryPointVersion>
  | {
      hash: Hex;
      request?: never;
    };

export type UseSendUserOperationMutationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<
  SendUserOperationWithEOA<TEntryPointVersion>,
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
    SendUserOperationWithEOA<TEntryPointVersion>,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationAsync: UseMutateAsyncFunction<
    SendUserOperationWithEOA<TEntryPointVersion>,
    Error,
    SendUserOperationParameters<TAccount>,
    unknown
  >;
  sendUserOperationResult:
    | SendUserOperationWithEOA<TEntryPointVersion>
    | undefined;
  isSendingUserOperation: boolean;
  error: Error | null;
};

/**
 * A hook that returns functions for sending user operations.
 * You can also optionally wait for a user operation to be mined before returning.
 *
 * @param params the parameters for the hook including the client, a flag to wait for tx mining, and mutation args (see {@link UseSendUserOperationArgs})
 * @returns functions and state for sending UOs {@link UseSendUserOperationResult}
 */
export function useSendUserOperation<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>(
  params: UseSendUserOperationArgs<TEntryPointVersion, TAccount>
): UseSendUserOperationResult<TEntryPointVersion, TAccount> {
  const { client, waitForTxn = false, ...mutationArgs } = params;

  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendUserOperation,
    mutateAsync: sendUserOperationAsync,
    data: sendUserOperationResult,
    isPending: isSendingUserOperation,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SendUserOperationParameters<TAccount>) => {
        if (isConnected) {
          console.warn(
            "useSendUserOperation: connected to an EOA, sending as a transaction instead"
          );
          const { uo } = params;

          if (Array.isArray(uo)) {
            throw new UnsupportedEOAActionError(
              "useSendUserOperation",
              "batch execute"
            );
          }

          if (typeof uo === "string") {
            throw new UnsupportedEOAActionError(
              "useSendUserOperation",
              "hex user operation"
            );
          }

          const tx = await wagmi_sendTransaction(wagmiConfig, {
            to: uo.target,
            data: uo.data,
            value: uo.value,
          });

          return {
            hash: tx,
          };
        }

        if (!client) {
          throw new ClientUndefinedHookError("useSendUserOperation");
        }

        if (!waitForTxn) {
          return client.sendUserOperation(params);
        }

        const { hash, request } = await client.sendUserOperation(params);
        const txnHash = await client
          .waitForUserOperationTransaction({ hash })
          .catch((e) => {
            throw new WaitForUserOperationError(request, e);
          });

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
