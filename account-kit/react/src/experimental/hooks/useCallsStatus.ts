import { BaseError, clientHeaderTrack } from "@aa-sdk/core";
import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import type { getCallsStatus } from "@account-kit/wallet-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type Address, type Hex } from "viem";
import { ClientUndefinedHookError } from "../../errors.js";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import { ReactLogger } from "../../metrics.js";

export type UseCallsStatusParams = {
  client?: GetSmartWalletClientResult<Address>;
  callId?: Hex;
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
 * import { useCallsStatus } from "@account-kit/react/experimental";
 *
 * function MyComponent() {
 *   const { data: callsStatus, isLoading, error } = useCallsStatus({
 *     client: smartWalletClient,
 *     callId: "0x1234...", // The call ID from sendPreparedCalls
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
  const { client, callId } = params;
  const { queryClient } = useAlchemyAccountContext();

  return useQuery(
    {
      queryKey: ["useCallsStatus", params.callId],
      queryFn: ReactLogger.profiled(
        "useCallsStatus",
        async (): Promise<QueryResult> => {
          if (!client) {
            throw new ClientUndefinedHookError("useCallsStatus");
          }
          if (!callId) {
            throw new BaseError("Expected callId to be defined");
          }

          const _client = clientHeaderTrack(client, "reactUseCallsStatus");

          return await _client.getCallsStatus(callId);
        },
      ),
      enabled: !!client && !!params.callId,
    },
    queryClient,
  );
}
