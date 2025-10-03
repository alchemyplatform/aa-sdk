import { useCallback, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { swapActions } from "@account-kit/wallet-client/experimental";
import { useAlchemyClient } from "./useAlchemyClient.js";
import { useAlchemyConfig } from "../Provider.js";
import type {
  PrepareSwapRequest,
  PrepareSwapResult,
  UsePrepareSwapResult,
} from "../types";

/**
 * Hook to request swap quotes and prepare swap calls
 * Part of the two-step swap process: prepare → submit
 *
 * Supports two modes:
 * 1. Specify exact amount to swap FROM (`fromAmount`)
 * 2. Specify minimum amount to receive TO (`minimumToAmount`)
 *
 * @returns {UsePrepareSwapResult} Hook result with prepareSwap function and state
 *
 * @example Swap exact amount FROM
 * ```tsx
 * const { prepareSwap } = useAlchemyPrepareSwap();
 *
 * // Swap exactly 1 ETH for USDC
 * const result = await prepareSwap({
 *   fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
 *   toToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *   fromAmount: '0xde0b6b3a7640000', // 1 ETH in hex
 * });
 * ```
 *
 * @example Swap for minimum amount TO
 * ```tsx
 * const { prepareSwap } = useAlchemyPrepareSwap();
 *
 * // Swap ETH to get at least 100 USDC
 * const result = await prepareSwap({
 *   fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
 *   toToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *   minimumToAmount: '0x5f5e100', // 100 USDC (6 decimals) in hex
 * });
 * console.log('Quote expiry:', new Date(parseInt(result.quote.expiry, 16) * 1000));
 * ```
 */
export function useAlchemyPrepareSwap(): UsePrepareSwapResult {
  const { wallets } = useWallets();
  const { client: getClient } = useAlchemyClient();
  const config = useAlchemyConfig();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PrepareSwapResult | null>(null);

  const getEmbeddedWallet = useCallback(() => {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) {
      throw new Error(
        "Privy embedded wallet not found. Please ensure the user is authenticated.",
      );
    }
    return embedded;
  }, [wallets]);

  const prepareSwap = useCallback(
    async (request: PrepareSwapRequest): Promise<PrepareSwapResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate that only one of fromAmount or minimumToAmount is provided
        if (request.fromAmount && request.minimumToAmount) {
          throw new Error(
            "Cannot provide both fromAmount and minimumToAmount. Please specify only one.",
          );
        }

        if (!request.fromAmount && !request.minimumToAmount) {
          throw new Error("Must provide either fromAmount or minimumToAmount.");
        }

        const client = await getClient();
        const embeddedWallet = getEmbeddedWallet();

        // Extend client with swap actions
        const swapClient = client.extend(swapActions);

        // Determine if swap should be sponsored
        const hasPolicyId = !!config.policyId;
        const defaultSponsored = config.defaultSponsored ?? true;
        const shouldSponsor = hasPolicyId && defaultSponsored;

        // Build capabilities for gas sponsorship
        const policyId = Array.isArray(config.policyId)
          ? config.policyId[0]
          : config.policyId;

        const capabilities: {
          eip7702Auth: true;
          paymasterService?: { policyId: string };
        } = { eip7702Auth: true };

        if (shouldSponsor && policyId) {
          capabilities.paymasterService = { policyId };
        }

        // Request the swap quote with gas sponsorship capabilities
        // Build request with either fromAmount (exact amount to swap) OR minimumToAmount (minimum to receive)
        const baseRequest = {
          from: request.from || (embeddedWallet.address as Address),
          fromToken: request.fromToken,
          toToken: request.toToken,
          capabilities,
        };

        const quoteRequest = request.fromAmount
          ? { ...baseRequest, fromAmount: request.fromAmount }
          : { ...baseRequest, minimumToAmount: request.minimumToAmount! };

        const response = await swapClient.requestQuoteV0(quoteRequest);

        // Extract quote and prepared calls from response
        const { quote, ...preparedCalls } = response;

        // Validate that we got prepared calls, not raw calls
        if (preparedCalls.rawCalls) {
          throw new Error(
            "Received raw calls instead of prepared calls. Ensure returnRawCalls is not set to true.",
          );
        }

        const result: PrepareSwapResult = {
          quote,
          preparedCalls,
        };

        setData(result);
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to prepare swap");
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient, getEmbeddedWallet, config],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    prepareSwap,
    isLoading,
    error,
    data,
    reset,
  };
}
