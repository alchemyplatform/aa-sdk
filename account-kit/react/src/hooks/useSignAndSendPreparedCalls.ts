"use client";

import { type Address, type Prettify } from "viem";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import {
  type UseMutateAsyncFunction,
  type UseMutateFunction,
  useMutation,
} from "@tanstack/react-query";
import { clientHeaderTrack, AccountNotFoundError } from "@aa-sdk/core";
import { useAccount as wagmi_useAccount } from "wagmi";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../errors.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";
import type { UseSmartAccountClientResult } from "../hooks/useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";

export type UseSignAndSendPreparedCallsParams = {
  client: UseSmartAccountClientResult["client"] | undefined;
};

type MutationParams = Prettify<
  Parameters<SmartWalletClient<Address>["signPreparedCalls"]>[0]
>;

type MutationResult = Awaited<
  ReturnType<SmartWalletClient<Address>["sendPreparedCalls"]>
>;

export type UseSignAndSendPreparedCallsResult = {
  signAndSendPreparedCalls: UseMutateFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  signAndSendPreparedCallsAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  signAndSendPreparedCallsResult: MutationResult | undefined;
  isSigningAndSendingPreparedCalls: boolean;
  error: Error | null;
};

/**
 * Hook for signing and sending prepared calls from a smart account.
 *
 * This hook provides functionality to sign and send previously prepared calls to a smart account.
 * It handles both the signing and sending of prepared calls in a single operation, and does not support EOA wallets.
 *
 * @param {UseSignAndSendPreparedCallsParams} params - Configuration parameters for the hook
 * @param {UseSmartAccountClientResult["client"]} [params.client] - Smart account client instance
 *
 * @returns {UseSignAndSendPreparedCallsResult} An object containing:
 * - `signAndSendPreparedCalls`: Function to sign and send prepared calls synchronously (returns void)
 * - `signAndSendPreparedCallsAsync`: Async function to sign and send prepared calls (returns Promise)
 * - `signAndSendPreparedCallsResult`: The result of the last successful prepared call execution
 * - `isSigningAndSendingPreparedCalls`: Boolean indicating if prepared calls are currently being signed and sent
 * - `error`: Error from the last failed prepared call execution, if any
 *
 * @example
 * ```ts twoslash
 * import { useSignAndSendPreparedCalls } from "@account-kit/react";
 *
 * const { signAndSendPreparedCalls, signAndSendPreparedCallsAsync, isSigningAndSendingPreparedCalls, error } = useSignAndSendPreparedCalls();
 *
 * // Sign and send prepared calls
 * await signAndSendPreparedCallsAsync({
 *   preparedCalls: [
 *     // unsigned prepared call objects
 *   ]
 * });
 * ```
 *
 * @remarks
 * - This hook only works with smart accounts and does not support EOA wallets
 * - The hook handles both signing and sending of prepared calls in a single operation
 * - The returned result contains the prepared call IDs
 */
export function useSignAndSendPreparedCalls(
  params: UseSignAndSendPreparedCallsParams,
): UseSignAndSendPreparedCallsResult {
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
    mutate: signAndSendPreparedCalls,
    mutateAsync: signAndSendPreparedCallsAsync,
    data: signAndSendPreparedCallsResult,
    isPending: isSigningAndSendingPreparedCalls,
    error,
  } = useMutation(
    {
      mutationFn: async (params: MutationParams): Promise<MutationResult> => {
        if (isConnected) {
          throw new UnsupportedEOAActionError(
            "useSignAndSendPreparedCalls",
            "mutate",
          );
        }
        if (!smartWalletClient) {
          throw new ClientUndefinedHookError("useSignAndSendPreparedCalls");
        }

        if (!smartWalletClient.account) {
          throw new AccountNotFoundError();
        }

        const _smartWalletClient = clientHeaderTrack(
          smartWalletClient,
          "reactUseSignAndSendPreparedCalls",
        );

        const signedCalls = await _smartWalletClient.signPreparedCalls(params);

        const result = await _smartWalletClient.sendPreparedCalls(signedCalls);

        return result;
      },
    },
    queryClient,
  );

  return {
    signAndSendPreparedCalls: ReactLogger.profiled(
      "signAndSendPreparedCalls",
      signAndSendPreparedCalls,
    ),
    signAndSendPreparedCallsAsync: ReactLogger.profiled(
      "signAndSendPreparedCallsAsync",
      signAndSendPreparedCallsAsync,
    ),
    signAndSendPreparedCallsResult,
    isSigningAndSendingPreparedCalls,
    error,
  };
}
