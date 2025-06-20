import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import { type Address, type Prettify } from "viem";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import {
  type UseMutateAsyncFunction,
  type UseMutateFunction,
  useMutation,
} from "@tanstack/react-query";
import { clientHeaderTrack } from "@aa-sdk/core";
import { useAccount as wagmi_useAccount } from "wagmi";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../../errors.js";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import { ReactLogger } from "../../metrics.js";

export type UseSendPreparedCallsParams = {
  client?: GetSmartWalletClientResult<Address>;
};

type MutationParams = Prettify<
  Parameters<SmartWalletClient<Address>["sendPreparedCalls"]>[0]
>;

type MutationResult = Awaited<
  ReturnType<SmartWalletClient<Address>["sendPreparedCalls"]>
>;

export type UseSendPreparedCallsResult = {
  sendPreparedCalls: UseMutateFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  sendPreparedCallsAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  sendPreparedCallsResult: MutationResult | undefined;
  isSendingPreparedCalls: boolean;
  error: Error | null;
};

/**
 * Hook for sending prepared calls to a smart account.
 *
 * This hook provides functionality to send previously prepared calls to a smart account.
 * It handles the signing and sending of prepared calls, but does not support EOA wallets.
 *
 * @param {UseSendPreparedCallsParams} params - Configuration parameters for the hook
 * @param {GetSmartWalletClientResult<Address>} [params.client] - Smart wallet client instance
 *
 * @returns {UseSendPreparedCallsResult} An object containing:
 * - `sendPreparedCalls`: Function to send prepared calls synchronously (returns void)
 * - `sendPreparedCallsAsync`: Async function to send prepared calls (returns Promise)
 * - `sendPreparedCallsResult`: The result of the last successful prepared call execution
 * - `isSendingPreparedCalls`: Boolean indicating if prepared calls are currently being sent
 * - `error`: Error from the last failed prepared call execution, if any
 *
 * @example
 * ```tsx
 * const { sendPreparedCalls, sendPreparedCallsAsync, isSendingPreparedCalls, error } = useSendPreparedCalls();
 *
 * // Send prepared calls
 * await sendPreparedCallsAsync({
 *   preparedCalls: [/* prepared call objects *\/]
 * });
 * ```
 *
 * @description
 * - This hook only works with smart accounts and does not support EOA wallets
 * - The hook handles the signing and sending of prepared calls
 * - The returned result contains the prepared call IDs
 */
export function useSendPreparedCalls(
  params: UseSendPreparedCallsParams,
): UseSendPreparedCallsResult {
  const { client: _client } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendPreparedCalls,
    mutateAsync: sendPreparedCallsAsync,
    data: sendPreparedCallsResult,
    isPending: isSendingPreparedCalls,
    error,
  } = useMutation(
    {
      mutationFn: async (params: MutationParams): Promise<MutationResult> => {
        if (isConnected) {
          throw new UnsupportedEOAActionError("useSendPreparedCalls", "mutate");
        }
        if (!_client) {
          throw new ClientUndefinedHookError("useSendPreparedCalls");
        }

        const client = clientHeaderTrack(_client, "reactUseSendPreparedCalls");

        const result = await client.sendPreparedCalls(params);

        return result;
      },
    },
    queryClient,
  );

  return {
    sendPreparedCalls: ReactLogger.profiled(
      "sendPreparedCalls",
      sendPreparedCalls,
    ),
    sendPreparedCallsAsync: ReactLogger.profiled(
      "sendPreparedCallsAsync",
      sendPreparedCallsAsync,
    ),
    sendPreparedCallsResult,
    isSendingPreparedCalls,
    error,
  };
}
