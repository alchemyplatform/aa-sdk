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

export type UsePrepareCallsParams = {
  client?: GetSmartWalletClientResult<Address>;
};

type MutationParams = Parameters<SmartWalletClient<Address>["prepareCalls"]>[0];

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
