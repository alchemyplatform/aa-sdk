import { useCallback, useState } from "react";
import { swapActions } from "@account-kit/wallet-client/experimental";
import { useAlchemyClient } from "./useAlchemyClient.js";
import type {
  PrepareSwapResult,
  SubmitSwapResult,
  UseSubmitSwapResult,
} from "../types.js";

/**
 * Hook to sign and submit prepared swap calls
 * Part of the two-step swap process: prepare → submit
 *
 * @returns {UseSubmitSwapResult} Hook result with submitSwap function and state
 *
 * @example
 * ```tsx
 * const { prepareSwap } = useAlchemyPrepareSwap();
 * const { submitSwap, isLoading, error, data } = useAlchemySubmitSwap();
 *
 * const handleSwap = async () => {
 *   try {
 *     // Step 1: Prepare the swap
 *     const preparedSwap = await prepareSwap({
 *       fromToken: '0x...',
 *       toToken: '0x...',
 *       fromAmount: '0x...',
 *     });
 *
 *     // Step 2: Submit the swap
 *     const result = await submitSwap(preparedSwap);
 *     console.log('Swap confirmed:', result.txnHash);
 *   } catch (err) {
 *     console.error('Swap failed:', err);
 *   }
 * };
 * ```
 */
export function useAlchemySubmitSwap(): UseSubmitSwapResult {
  const { getClient } = useAlchemyClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SubmitSwapResult | null>(null);

  const submitSwap = useCallback(
    async (preparedSwap: PrepareSwapResult): Promise<SubmitSwapResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const { client } = await getClient();

        // Extend client with swap actions
        const swapClient = client.extend(swapActions);

        // Sign the prepared calls
        const signedCalls = await swapClient.signPreparedCalls(preparedSwap);

        // Send the signed calls
        const { preparedCallIds } =
          await swapClient.sendPreparedCalls(signedCalls);

        if (!preparedCallIds || preparedCallIds.length === 0) {
          throw new Error("No prepared call IDs returned from swap submission");
        }

        // Wait for the swap to be confirmed
        const callStatusResult = await swapClient.waitForCallsStatus({
          id: preparedCallIds[0],
          timeout: 60_000,
        });

        // Validate the transaction was successful
        if (
          callStatusResult.status !== "success" ||
          !callStatusResult.receipts ||
          !callStatusResult.receipts[0]
        ) {
          throw new Error(
            `Swap failed with status ${
              callStatusResult.status
            }. Full receipt:\n${JSON.stringify(callStatusResult, null, 2)}`,
          );
        }

        const txnHash = callStatusResult.receipts[0].transactionHash;
        if (!txnHash) {
          throw new Error("Transaction hash not found in receipt");
        }

        const result: SubmitSwapResult = { txnHash };
        setData(result);
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to submit swap");
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    submitSwap,
    isLoading,
    error,
    data,
    reset,
  };
}
