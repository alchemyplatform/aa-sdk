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

export type UsePrepareCallsParams = {
  client: GetSmartWalletClientResult<Address> | undefined;
};

type MutationParams = Prettify<
  Parameters<SmartWalletClient<Address>["prepareCalls"]>[0]
>;

type MutationResult = Awaited<
  ReturnType<SmartWalletClient<Address>["prepareCalls"]>
>;

export type UsePrepareCallsResult = {
  prepareCalls: UseMutateFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  prepareCallsAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  preparedCalls: MutationResult | undefined;
  isPreparingCalls: boolean;
  error: Error | null;
};

/**
 * Hook for preparing calls to a smart account.
 *
 * This hook provides functionality to prepare calls for execution on a smart account.
 * It handles the preparation step of the Account Abstraction flow, but does not support EOA wallets.
 *
 * @param {UsePrepareCallsParams} params - Configuration parameters for the hook
 * @param {GetSmartWalletClientResult<Address>} [params.client] - Smart wallet client instance
 *
 * @returns {UsePrepareCallsResult} An object containing:
 * - `prepareCalls`: Function to prepare calls synchronously (returns void)
 * - `prepareCallsAsync`: Async function to prepare calls (returns Promise)
 * - `preparedCalls`: The result of the last successful call preparation
 * - `isPreparingCalls`: Boolean indicating if calls are currently being prepared
 * - `error`: Error from the last failed call preparation, if any
 *
 * @example
 * ```tsx
 * const { prepareCalls, prepareCallsAsync, isPreparingCalls, error } = usePrepareCalls();
 *
 * // Prepare calls
 * await prepareCallsAsync({
 *   calls: [{
 *     to: "0x...",
 *     data: "0x...",
 *     value: "0x0"
 *   }]
 * });
 * ```
 *
 * @description
 * - This hook only works with smart accounts and does not support EOA wallets
 * - The hook handles the preparation step of the Account Abstraction flow
 * - Prepared calls must be signed, then can be used with `useSendPreparedCalls` to complete the execution
 */
export function usePrepareCalls(
  params: UsePrepareCallsParams,
): UsePrepareCallsResult {
  const { client: _client } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: prepareCalls,
    mutateAsync: prepareCallsAsync,
    data: preparedCalls,
    isPending: isPreparingCalls,
    error,
  } = useMutation(
    {
      mutationFn: async (params: MutationParams): Promise<MutationResult> => {
        if (isConnected) {
          throw new UnsupportedEOAActionError("usePrepareCalls", "mutate");
        }
        if (!_client) {
          throw new ClientUndefinedHookError("usePrepareCalls");
        }

        const client = clientHeaderTrack(_client, "reactUsePrepareCalls");

        const preparedCalls = await client.prepareCalls(params);

        return preparedCalls;
      },
    },
    queryClient,
  );

  return {
    prepareCalls: ReactLogger.profiled("prepareCalls", prepareCalls),
    prepareCallsAsync: ReactLogger.profiled(
      "prepareCallsAsync",
      prepareCallsAsync,
    ),
    preparedCalls,
    isPreparingCalls,
    error,
  };
}
