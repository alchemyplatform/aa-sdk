"use client";

import {
  clientHeaderTrack,
  type EntryPointVersion,
  type UserOperationRequest,
  AccountNotFoundError,
} from "@aa-sdk/core";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { sendTransaction as wagmi_sendTransaction } from "@wagmi/core";
import { fromHex, type Address, type Hex, type Prettify } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../errors.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";

export type UseSendCallsParams = {
  client: UseSmartAccountClientResult["client"] | undefined;
};

type MutationParams = Prettify<
  Parameters<SmartWalletClient<Address>["prepareCalls"]>[0]
>;

type MutationResult<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  ids: Hex[];
  // TODO: deprecate this
  request?: UserOperationRequest<TEntryPointVersion>;
};

export type UseSendCallsResult<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  sendCalls: UseMutateFunction<
    MutationResult<TEntryPointVersion>,
    Error,
    MutationParams,
    unknown
  >;
  sendCallsAsync: UseMutateAsyncFunction<
    MutationResult<TEntryPointVersion>,
    Error,
    MutationParams,
    unknown
  >;
  sendCallsResult: MutationResult | undefined;
  isSendingCalls: boolean;
  error: Error | null;
};

/**
 * Hook for sending calls to a smart account or EOA wallet.
 *
 * This hook provides functionality to execute calls on a smart account using Account Abstraction,
 * or fall back to regular EOA transactions when connected to an EOA wallet. It handles the complete
 * flow of preparing, signing, and sending calls.
 *
 * <Note>
 * If using this hook with an ERC-20 paymaster in pre-operation mode with `autoPermit`, the contents of the permit will be hidden
 * from the user. It is recommended to use the `usePrepareCalls` hook instead to manually handle the permit signature.
 * </Note>
 *
 * @template TEntryPointVersion - The entry point version to use for user operations (defaults to EntryPointVersion)
 *
 * @param {UseSendCallsParams} params - Configuration parameters for the hook
 * @param {GetSmartWalletClientResult<Address>} [params.client] - Optional smart wallet client instance (Required if an EOA is not connected)
 *
 * @returns {UseSendCallsResult<TEntryPointVersion>} An object containing:
 * - `sendCalls`: Function to send calls synchronously (returns void)
 * - `sendCallsAsync`: Async function to send calls (returns Promise)
 * - `sendCallsResult`: The result of the last successful call execution
 * - `isSendingCalls`: Boolean indicating if calls are currently being sent
 * - `error`: Error from the last failed call execution, if any
 *
 * @example
 * ```tsx
 * const { sendCalls, sendCallsAsync, isSendingCalls, error } = useSendCalls();
 *
 * // Send a single call
 * await sendCallsAsync({
 *   calls: [{
 *     to: "0x...",
 *     data: "0x...",
 *     value: "0x0"
 *   }]
 * });
 *
 * // Send multiple calls (smart account only)
 * await sendCallsAsync({
 *   calls: [
 *     { to: "0x...", data: "0x..." },
 *     { to: "0x...", data: "0x..." }
 *   ]
 * });
 * ```
 *
 * @description
 * - When connected to an EOA wallet, only single calls are supported (batch execution is not allowed)
 * - For smart accounts, the returned `ids` are the prepared call IDs
 * - For EOA wallets, the returned `ids` are transaction hashes
 */
// TODO: remove the entrypoint version generic when we don't need it anymore
export function useSendCalls<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
>(params: UseSendCallsParams): UseSendCallsResult<TEntryPointVersion> {
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const smartWalletClient = useSmartWalletClient({
    account: params.client?.account.address,
  });
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendCalls,
    mutateAsync: sendCallsAsync,
    data: sendCallsResult,
    isPending: isSendingCalls,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: Parameters<SmartWalletClient<Address>["prepareCalls"]>[0],
      ): Promise<MutationResult<TEntryPointVersion>> => {
        if (isConnected) {
          console.warn(
            "useSendCalls: connected to an EOA, sending as a transaction instead",
          );
          if (params.calls.length !== 1) {
            throw new UnsupportedEOAActionError(
              "useSendCalls",
              "batch execute",
            );
          }

          const [call] = params.calls;

          const tx = await wagmi_sendTransaction(wagmiConfig, {
            to: call.to,
            data: call.data,
            value: call.value ? fromHex(call.value, "bigint") : undefined,
          });

          return {
            ids: [tx],
          };
        }

        if (!smartWalletClient) {
          throw new ClientUndefinedHookError("useSendCalls");
        }

        if (!smartWalletClient.account) {
          throw new AccountNotFoundError();
        }

        const _smartWalletClient = clientHeaderTrack(
          smartWalletClient,
          "reactUseSendCalls",
        );

        let preparedCalls = await _smartWalletClient.prepareCalls(params);

        if (preparedCalls.type === "paymaster-permit") {
          const signature = await _smartWalletClient.signSignatureRequest(
            preparedCalls.signatureRequest,
          );

          const params = {
            calls: preparedCalls.modifiedRequest.calls,
            capabilities: preparedCalls.modifiedRequest.capabilities,
            paymasterPermitSignature: signature,
          };

          preparedCalls = await _smartWalletClient.prepareCalls(params);
        }

        const signedCalls =
          await _smartWalletClient.signPreparedCalls(preparedCalls);

        const { preparedCallIds } =
          await _smartWalletClient.sendPreparedCalls(signedCalls);

        const uoCall =
          signedCalls.type === "array"
            ? signedCalls.data.find(
                (it) =>
                  it.type === "user-operation-v060" ||
                  it.type === "user-operation-v070",
              )!
            : signedCalls;

        return {
          ids: preparedCallIds,
          request: {
            ...uoCall.data,
            signature: uoCall.signature.data,
          } as UserOperationRequest<TEntryPointVersion>,
        };
      },
    },
    queryClient,
  );

  return {
    sendCalls: ReactLogger.profiled("sendCalls", sendCalls),
    sendCallsAsync: ReactLogger.profiled("sendCallsAsync", sendCallsAsync),
    sendCallsResult,
    isSendingCalls,
    error,
  };
}
