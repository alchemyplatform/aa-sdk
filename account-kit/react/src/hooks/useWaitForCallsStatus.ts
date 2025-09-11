"use client";

import { clientHeaderTrack } from "@aa-sdk/core";
import type { waitForCallsStatus } from "@account-kit/wallet-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ClientUndefinedHookError } from "../errors.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";
import type { WaitForCallsStatusParameters } from "viem/actions";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";

export interface UseWaitForCallsStatusParams
  extends WaitForCallsStatusParameters {
  client: UseSmartAccountClientResult["client"] | undefined;
}

type QueryResult = Awaited<ReturnType<typeof waitForCallsStatus>>;

export type UseWaitForCallsStatusResult = UseQueryResult<QueryResult>;

/**
 * Hook to wait for calls status to be confirmed.
 * It will poll until the calls reach the desired status or until a timeout occurs.
 *
 * @example
 * ```tsx
 * import { useWaitForCallsStatus } from "@account-kit/react";
 *
 * function MyComponent() {
 *   const { data: result, isLoading, error } = useWaitForCallsStatus({
 *     client: smartWalletClient,
 *     id: "0x1234...", // The call ID from sendPreparedCalls
 *     timeout: 30_000, // 30 second timeout
 *   });
 * }
 * ```
 *
 * @param {UseWaitForCallsStatusParams} params - Parameters for the hook
 * @param {GetSmartWalletClientResult<Address> | undefined} params.client - Smart wallet client instance. The hook will not fetch until this is defined.
 *
 * @returns {UseWaitForCallsStatusResult} Query result containing the final status
 */
export function useWaitForCallsStatus({
  client,
  ...params
}: UseWaitForCallsStatusParams): UseWaitForCallsStatusResult {
  const { queryClient } = useAlchemyAccountContext();
  const smartWalletClient = useSmartWalletClient({
    account: client?.account.address,
  });

  return useQuery<QueryResult>(
    {
      queryKey: ["useWaitForCallsStatus", params.id],
      queryFn: ReactLogger.profiled(
        "useWaitForCallsStatus",
        async (): Promise<QueryResult> => {
          if (!smartWalletClient) {
            throw new ClientUndefinedHookError("useWaitForCallsStatus");
          }

          const _smartWalletClient = clientHeaderTrack(
            smartWalletClient,
            "reactUseWaitForCallsStatus",
          );

          return await _smartWalletClient.waitForCallsStatus(params);
        },
      ),
      enabled: !!client,
    },
    queryClient,
  );
}
