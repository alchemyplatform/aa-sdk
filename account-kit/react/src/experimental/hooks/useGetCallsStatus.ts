import { clientHeaderTrack } from "@aa-sdk/core";
import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import type {
  SmartWalletClient,
  getCallsStatus,
} from "@account-kit/wallet-client";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { type Address } from "viem";
import { ClientUndefinedHookError } from "../../errors.js";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import { ReactLogger } from "../../metrics.js";

export type UseGetCallsStatusParams = {
  client?: GetSmartWalletClientResult<Address>;
};

type MutationResult = Awaited<ReturnType<typeof getCallsStatus>>;

export type UseGetCallsStatusResult = {
  getCallsStatus: UseMutateFunction<
    MutationResult,
    Error,
    Parameters<SmartWalletClient<Address>["getCallsStatus"]>[0],
    unknown
  >;
  getCallsStatusAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    Parameters<SmartWalletClient<Address>["getCallsStatus"]>[0],
    unknown
  >;
  callsStatusResult: MutationResult | undefined;
  isLoading: boolean;
  error: Error | null;
};

export function useGetCallsStatus(
  params: UseGetCallsStatusParams,
): UseGetCallsStatusResult {
  const { client: _client } = params;
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: getCallsStatus,
    mutateAsync: getCallsStatusAsync,
    data: callsStatusResult,
    isPending: isLoading,
    error,
  } = useMutation(
    {
      mutationFn: async (
        params: Parameters<SmartWalletClient<Address>["getCallsStatus"]>[0],
      ): Promise<MutationResult> => {
        if (!_client) {
          throw new ClientUndefinedHookError("useGetCallsStatus");
        }

        const client = clientHeaderTrack(_client, "reactUseGetCallsStatus");

        return await client.getCallsStatus(params);
      },
    },
    queryClient,
  );

  return {
    getCallsStatus: ReactLogger.profiled("getCallsStatus", getCallsStatus),
    getCallsStatusAsync: ReactLogger.profiled(
      "getCallsStatusAsync",
      getCallsStatusAsync,
    ),
    callsStatusResult,
    isLoading,
    error,
  };
}
