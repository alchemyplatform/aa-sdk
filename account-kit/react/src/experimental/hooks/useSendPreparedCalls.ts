import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import { type Address } from "viem";
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

type MutationParams = Parameters<
  SmartWalletClient<Address>["sendPreparedCalls"]
>[0];

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

export function usePrepareCalls(
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
