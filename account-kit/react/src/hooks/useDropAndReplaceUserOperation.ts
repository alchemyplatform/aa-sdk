"use client";

import type {
  DropAndReplaceUserOperationParameters,
  GetEntryPointFromAccount,
  SendUserOperationResult,
} from "@aa-sdk/core";
import type { SupportedAccounts } from "@account-kit/core";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseDropAndReplaceUserOperationMutationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = BaseHookMutationArgs<
  SendUserOperationResult<TEntryPointVersion>,
  DropAndReplaceUserOperationParameters<TAccount>
>;

export type UseDropAndReplaceUserOperationArgs<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseDropAndReplaceUserOperationMutationArgs<TEntryPointVersion, TAccount>;

export type UseDropAndReplaceUserOperationResult<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  dropAndReplaceUserOperation: UseMutateFunction<
    SendUserOperationResult<TEntryPointVersion>,
    Error,
    DropAndReplaceUserOperationParameters<TAccount>,
    unknown
  >;
  dropAndReplaceUserOperationResult:
    | SendUserOperationResult<TEntryPointVersion>
    | undefined;
  isDroppingAndReplacingUserOperation: boolean;
  error: Error | null;
};

/**
 * Custom [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useDropAndReplaceUserOperation.ts) that handles the drop and replace user operation for a given client and mutation arguments.
 *
 * @example
 * ```tsx
 * import {
 *   useDropAndReplaceUserOperation,
 *   useSendUserOperation,
 *   useSmartAccountClient,
 * } from "@account-kit/react";
 *
 * export function ComponentWithDropAndReplaceUO() {
 *   const { client } = useSmartAccountClient({
 *     type: "MultiOwnerModularAccount",
 *   });
 *   const { sendUserOperationAsync, isSendingUserOperation } =
 *     useSendUserOperation({
 *       client,
 *     });
 *   const { dropAndReplaceUserOperation, isDroppingAndReplacingUserOperation } =
 *     useDropAndReplaceUserOperation({
 *       client,
 *       onSuccess: ({ hash, request }) => {
 *         // [optional] Do something with the hash and request
 *       },
 *       onError: (error) => {
 *         // [optional] Do something with the error
 *       },
 *       // [optional] ...additional mutationArgs
 *     });
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={async () => {
 *           const { request } = await sendUserOperationAsync({
 *             uo: {
 *              target: "0xTARGET_ADDRESS",
 *              data: "0x",
 *              value: 0n,
 *             },
 *           });
 *
 *           dropAndReplaceUserOperation({
 *             uoToDrop: request,
 *           });
 *         }}
 *         disabled={isSendingUserOperation || isDroppingAndReplacingUserOperation}
 *       >
 *         {isSendingUserOperation
 *           ? "Sending..."
 *           : isDroppingAndReplacingUserOperation
 *           ? "Replacing..."
 *           : "Send then Replace UO"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param {UseDropAndReplaceUserOperationArgs<TEntryPointVersion, TAccount>} config The configuration parameters including the client and other mutation arguments. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useDropAndReplaceUserOperation.ts#L23)
 * @returns {UseDropAndReplaceUserOperationResult<TEntryPointVersion, TAccount>} The result containing the mutation function, result data, loading state, and any error. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useDropAndReplaceUserOperation.ts#L30)
 */
export function useDropAndReplaceUserOperation<
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>({
  client,
  ...mutationArgs
}: UseDropAndReplaceUserOperationArgs<
  TEntryPointVersion,
  TAccount
>): UseDropAndReplaceUserOperationResult<TEntryPointVersion, TAccount> {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: dropAndReplaceUserOperation,
    data: dropAndReplaceUserOperationResult,
    isPending: isDroppingAndReplacingUserOperation,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: DropAndReplaceUserOperationParameters<TAccount>
      ) => {
        if (!client) {
          throw new ClientUndefinedHookError("useDropAndReplaceUserOperation");
        }

        return client.dropAndReplaceUserOperation(params);
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    dropAndReplaceUserOperation,
    dropAndReplaceUserOperationResult,
    isDroppingAndReplacingUserOperation,
    error,
  };
}
