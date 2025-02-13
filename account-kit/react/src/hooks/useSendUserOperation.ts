"use client";

import type {
  EntryPointVersion,
  GetEntryPointFromAccount,
  SendUserOperationParameters,
  SendUserOperationResult,
} from "@aa-sdk/core";
import { WaitForUserOperationError } from "@aa-sdk/core";
import type { SupportedAccounts } from "@account-kit/core";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { sendTransaction as wagmi_sendTransaction } from "@wagmi/core";
import type { Hex } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../errors.js";
import { ReactLogger } from "../metrics.js";
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
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSendUserOperation.ts) that returns functions for sending user operations.
 * You can also optionally wait for a user operation to be mined and get the transaction hash before returning using `waitForTx`.
 * Like any method that takes a smart account client, throws an error if client undefined or is signer not authenticated.
 *
 * @param {UseSendUserOperationArgs<TEntryPointVersion, TAccount>} params the parameters for the hook including the client, a flag to wait for tx mining, and mutation args. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSendUserOperation.ts#L45)
 * @returns {UseSendUserOperationResult<TEntryPointVersion, TAccount>} functions and state for sending UOs. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSendUserOperation.ts#L53)
 *
 * @example
 * ```tsx twoslash
 * import React from 'react';
 * import {
 *   useSendUserOperation,
 *   useSmartAccountClient,
 * } from "@account-kit/react";
 *
 * function ComponentWithSendUserOperation() {
 *   const { client } = useSmartAccountClient({
 *     type: "MultiOwnerModularAccount",
 *   });
 *   const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
 *     client,
 *     // optional parameter that will wait for the transaction to be mined before returning
 *     waitForTxn: true,
 *     onSuccess: ({ hash, request }) => {
 *       // [optional] Do something with the hash and request
 *     },
 *     onError: (error) => {
 *       // [optional] Do something with the error
 *     },
 *     // [optional] ...additional mutationArgs
 *   });
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={() =>
 *           sendUserOperation({
 *            uo: {
 *             target: "0xTARGET_ADDRESS",
 *             data: "0x",
 *             value: 0n,
 *           }
 *          })
 *         }
 *         disabled={isSendingUserOperation}
 *       >
 *         {isSendingUserOperation ? "Sending..." : "Send UO"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
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
    sendUserOperation: ReactLogger.profiled(
      "sendUserOperation",
      sendUserOperation
    ),
    sendUserOperationAsync: ReactLogger.profiled(
      "sendUserOperationAsync",
      sendUserOperationAsync
    ),
    sendUserOperationResult,
    isSendingUserOperation,
    error,
  };
}
