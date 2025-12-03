"use client";

import { type Prettify } from "viem";
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
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";
import { swapActions } from "@account-kit/wallet-client/experimental";

export type UsePrepareSwapParams = {
  client: UseSmartAccountClientResult["client"] | undefined;
};

type MutationParams = Prettify<
  Parameters<ReturnType<typeof swapActions>["requestQuoteV0"]>[0]
>;

type MutationResult = Awaited<
  ReturnType<ReturnType<typeof swapActions>["requestQuoteV0"]>
>;

export type UsePrepareSwapResult = {
  prepareSwap: UseMutateFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  prepareSwapAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  quote: MutationResult | undefined;
  isPreparingSwap: boolean;
  error: Error | null;
};

/**
 * Hook for requesting swap quotes from a smart account.
 *
 * This hook provides functionality to request swap quotes for token swaps.
 *
 * @param {UsePrepareSwapParams} params - Configuration parameters for the hook
 * @param {UseSmartAccountClientResult["client"]} [params.client] - Smart account client instance
 *
 * @returns {UsePrepareSwapResult} An object containing:
 * - `prepareSwap`: Function to request quote and prepare the swap synchronously
 * - `prepareSwapAsync`: Async function to request quote and prepare the swap (returns Promise)
 * - `quote`: The result of the last successful quote request
 * - `isPreparingSwap`: Boolean indicating if a quote is currently being requested
 * - `error`: Error from the last failed quote request, if any
 *
 * @example
 * ```ts twoslash
 * import { usePrepareSwap } from "@account-kit/react";
 *
 * const { prepareSwapAsync, isPreparingSwap, error } = usePrepareSwap();
 *
 * // Request a swap quote
 * const quote = await prepareSwapAsync({
 *   fromToken: "0x...",
 *   toToken: "0x...",
 *   minimumToAmount: "0x..."
 * });
 * ```
 *
 * @description
 * - This hook only works with smart accounts and does not support EOA wallets
 * - The hook handles the quote request step of the swap flow
 * - The returned quote can be used with `useSignAndSendPreparedCalls` to complete the swap.
 */
export function usePrepareSwap(
  params: UsePrepareSwapParams,
): UsePrepareSwapResult {
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
    mutate: requestQuoteV0,
    mutateAsync: requestQuoteV0Async,
    data: quote,
    isPending: isPreparingSwap,
    error,
  } = useMutation(
    {
      mutationFn: async (params: MutationParams): Promise<MutationResult> => {
        if (isConnected) {
          throw new UnsupportedEOAActionError("usePrepareSwap", "mutate");
        }
        if (!smartWalletClient) {
          throw new ClientUndefinedHookError("usePrepareSwap");
        }

        if (!smartWalletClient.account) {
          throw new AccountNotFoundError();
        }

        const _smartWalletClient = clientHeaderTrack(
          smartWalletClient,
          "reactUsePrepareSwap",
        );

        // Extend the client with swap actions
        const swapClient = _smartWalletClient.extend(swapActions);

        return swapClient.requestQuoteV0(params);
      },
    },
    queryClient,
  );

  return {
    prepareSwap: ReactLogger.profiled("prepareSwap", requestQuoteV0),
    prepareSwapAsync: ReactLogger.profiled(
      "prepareSwapAsync",
      requestQuoteV0Async,
    ),
    quote,
    isPreparingSwap,
    error,
  };
}
