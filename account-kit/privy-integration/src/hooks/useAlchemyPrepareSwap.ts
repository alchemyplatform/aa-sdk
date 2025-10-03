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
 * @returns {UsePrepareSwapResult} Hook result with prepareSwap function and state
 *
 * @example
 * ```tsx
 * const { prepareSwap, isLoading, error, data } = useAlchemyPrepareSwap();
 *
 * const handlePrepare = async () => {
 *   try {
 *     const result = await prepareSwap({
 *       from: '0x...',
 *       fromToken: '0x...',
 *       toToken: '0x...',
 *       minimumToAmount: '0x...',
 *     });
 *     console.log('Quote:', result.quote);
 *     console.log('Expiry:', new Date(parseInt(result.quote.expiry, 16) * 1000));
 *
 *     // Pass result.preparedCalls to submitSwap
 *   } catch (err) {
 *     console.error('Failed to prepare swap:', err);
 *   }
 * };
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
        const response = await swapClient.requestQuoteV0({
          from: request.from || (embeddedWallet.address as Address),
          fromToken: request.fromToken,
          toToken: request.toToken,
          minimumToAmount: request.minimumToAmount,
          capabilities,
        });

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
