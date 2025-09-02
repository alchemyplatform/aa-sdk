"use client";

import { BaseError, clientHeaderTrack } from "@aa-sdk/core";
import type { getCallsStatus } from "@account-kit/wallet-client";
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { Hex } from "viem";
import { ClientUndefinedHookError } from "../errors.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";

export type UseCallsStatusParams = {
  client: UseSmartAccountClientResult["client"] | undefined;
  callId: Hex | undefined;
  queryOptions?: Omit<UseQueryOptions<QueryResult>, "queryKey" | "queryFn">;
};

type QueryResult = Awaited<ReturnType<typeof getCallsStatus>>;

export type UseCallsStatusResult = UseQueryResult<QueryResult>;

/**
 * Hook to retrieve the status of prepared calls from the Wallet API.
 *
 * This hook queries the status of a specific call ID that was returned from `wallet_sendPreparedCalls`.
 * The status indicates whether the batch of calls has been processed, confirmed, or failed on-chain.
 *
 * @example
 * ```tsx
 * import { useCallsStatus } from "@account-kit/react";
 *
 * function MyComponent() {
 *   const { data: callsStatus, isLoading, error } = useCallsStatus({
 *     client: smartWalletClient,
 *     callId: "0x1234...", // The call ID from sendPreparedCalls
 *     queryOptions: {
 *       // Refetch every 2 sec while pending.
 *       refetchInterval: (q) => q.state.data?.status === 100 ? 2000 : false,
 *     }
 *   });
 * }
 * ```
 *
 * @param {UseCallsStatusParams} params - Parameters for the hook
 * @param {GetSmartWalletClientResult<Address> | undefined} params.client - Smart wallet client instance. The hook will not fetch until this is defined.
 * @param {Hex | undefined} params.callId - A call ID (hex string) returned from `sendPreparedCalls`. The hook will not fetch until this is defined.
 *
 * @returns {UseCallsStatusResult} Query result
 */
export function useCallsStatus(
  params: UseCallsStatusParams,
): UseCallsStatusResult {
  const { callId } = params;
  const { queryClient } = useAlchemyAccountContext();
  const smartWalletClient = useSmartWalletClient({
    account: params.client?.account.address,
  });

  return useQuery<QueryResult>(
    {
      queryKey: ["useCallsStatus", params.callId],
      queryFn: ReactLogger.profiled(
        "useCallsStatus",
        async (): Promise<QueryResult> => {
          if (!smartWalletClient) {
            throw new ClientUndefinedHookError("useCallsStatus");
          }
          if (!callId) {
            throw new BaseError("Expected callId to be defined");
          }

          const _smartWalletClient = clientHeaderTrack(
            smartWalletClient,
            "reactUseCallsStatus",
          );

          return await _smartWalletClient.getCallsStatus(callId);
        },
      ),
      enabled: !!params.client && !!params.callId && !!smartWalletClient,
      ...params.queryOptions,
    },
    queryClient,
  );
}
