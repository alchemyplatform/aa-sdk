import {
  clientHeaderTrack,
  type EntryPointVersion,
  type UserOperationRequest,
} from "@aa-sdk/core";
import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { sendTransaction as wagmi_sendTransaction } from "@wagmi/core";
import { fromHex, type Address, type Hex } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../../errors.js";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import { ReactLogger } from "../../metrics.js";

export type UseSendCallsParams = {
  client?: GetSmartWalletClientResult<Address>;
};

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
    Parameters<SmartWalletClient<Address>["prepareCalls"]>[0],
    unknown
  >;
  sendCallsAsync: UseMutateAsyncFunction<
    MutationResult<TEntryPointVersion>,
    Error,
    Parameters<SmartWalletClient<Address>["prepareCalls"]>[0],
    unknown
  >;
  sendCallsResult: MutationResult | undefined;
  isSendingCalls: boolean;
  sendCallsError: Error | null;
};

// TODO: remove the entrypoint version generic when we don't need it anymore
export function useSendCalls<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
>(params: UseSendCallsParams): UseSendCallsResult<TEntryPointVersion> {
  const { client: _client } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: sendCalls,
    mutateAsync: sendCallsAsync,
    data: sendCallsResult,
    isPending: isSendingCalls,
    error: sendCallsError,
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

        if (!_client) {
          throw new ClientUndefinedHookError("useSendCalls");
        }

        const client = clientHeaderTrack(_client, "reactUseSendCalls");

        const preparedCalls = await client.prepareCalls(params);

        const signedCalls = await client.signPreparedCalls(preparedCalls);

        const { preparedCallIds } = await client.sendPreparedCalls(signedCalls);

        const signature = (
          signedCalls.type === "array"
            ? signedCalls.data[0].signature
            : signedCalls.signature
        ).data;

        return {
          ids: preparedCallIds,
          request: {
            ...preparedCalls.data,
            signature,
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
    sendCallsError,
  };
}
