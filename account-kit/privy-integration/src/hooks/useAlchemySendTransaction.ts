import { useCallback, useState } from "react";
import { type Address, type Hex, isHex } from "viem";
import { useAlchemyClient } from "./useAlchemyClient.js";
import { useAlchemyConfig } from "../Provider.js";
import { useEmbeddedWallet } from "./internal/useEmbeddedWallet.js";
import type {
  UnsignedTransactionRequest,
  SendTransactionOptions,
  SendTransactionResult,
  UseSendTransactionResult,
} from "../types";

/**
 * Normalize value to hex format
 * Accepts bigint, number, decimal string, or hex string
 *
 * @param {string | number | bigint} value - Value to normalize
 * @returns {Hex} Hex string representation of the value
 */
function normalizeValue(value: string | number | bigint): Hex {
  if (typeof value === "bigint") {
    return `0x${value.toString(16)}`;
  }
  if (typeof value === "number") {
    return `0x${BigInt(value).toString(16)}`;
  }
  if (isHex(value)) {
    return value;
  }
  // Assume decimal string
  return `0x${BigInt(value).toString(16)}`;
}

/**
 * Hook to send transactions with optional gas sponsorship via Alchemy
 * Drop-in alternative to Privy's useSendTransaction hook
 *
 * @returns {UseSendTransactionResult} Hook result with sendTransaction function and state
 *
 * @example
 * ```tsx
 * const { sendTransaction, isLoading, error, data } = useAlchemySendTransaction();
 *
 * const handleSend = async () => {
 *   try {
 *     const result = await sendTransaction({
 *       to: '0x...',
 *       data: '0x...',
 *       value: '1000000000000000000', // 1 ETH
 *     });
 *     console.log('Transaction hash:', result.txnHash);
 *   } catch (err) {
 *     console.error('Transaction failed:', err);
 *   }
 * };
 * ```
 */
export function useAlchemySendTransaction(): UseSendTransactionResult {
  const { getClient } = useAlchemyClient();
  const config = useAlchemyConfig();
  const getEmbeddedWallet = useEmbeddedWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SendTransactionResult | null>(null);

  const sendTransaction = useCallback(
    async (
      input: UnsignedTransactionRequest,
      options?: SendTransactionOptions,
    ): Promise<SendTransactionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const client = await getClient();
        const embeddedWallet = getEmbeddedWallet();

        // Determine if transaction should be sponsored
        const hasPolicyId = !!config.policyId;
        const enableSponsorship = !config.disableSponsorship;
        const shouldSponsor =
          options?.disableSponsorship !== undefined
            ? !options.disableSponsorship
            : hasPolicyId && enableSponsorship;

        // Format the transaction call
        const formattedCall = {
          to: input.to,
          data: input.data,
          value: input.value ? normalizeValue(input.value) : undefined,
        };

        // Build capabilities based on sponsorship
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

        // Send the transaction
        const result = await client.sendCalls({
          from: embeddedWallet.address as Address,
          calls: [formattedCall],
          capabilities,
        });

        if (!result.preparedCallIds || result.preparedCallIds.length === 0) {
          throw new Error(
            "No prepared call IDs returned from transaction submission",
          );
        }

        // Wait for the transaction to be confirmed
        const txStatus = await client.waitForCallsStatus({
          id: result.preparedCallIds[0],
          timeout: 60_000,
        });

        const txnHash = txStatus.receipts?.[0]?.transactionHash;
        if (!txnHash) {
          throw new Error("Transaction hash not found in receipt");
        }

        const txResult: SendTransactionResult = { txnHash };
        setData(txResult);
        return txResult;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Transaction failed");
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient, getEmbeddedWallet, config.policyId, config.disableSponsorship],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    sendTransaction,
    isLoading,
    error,
    data,
    reset,
  };
}
