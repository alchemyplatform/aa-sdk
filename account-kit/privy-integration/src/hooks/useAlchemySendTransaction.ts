import { useCallback, useState } from "react";
import { type Hex, isHex } from "viem";
import { useAlchemyClient } from "./useAlchemyClient.js";
import { useAlchemyConfig } from "../Provider.js";
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
 * Supports both single transactions and batch transactions
 * Drop-in alternative to Privy's useSendTransaction hook
 *
 * @returns {UseSendTransactionResult} Hook result with sendTransaction function and state
 *
 * @example Single transaction
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
 *
 * @example Batch transactions
 * ```tsx
 * const { sendTransaction } = useAlchemySendTransaction();
 *
 * const result = await sendTransaction([
 *   { to: '0x...', data: '0x...', value: '1000000000000000000' },
 *   { to: '0x...', data: '0x...' },
 * ]);
 * ```
 */
export function useAlchemySendTransaction(): UseSendTransactionResult {
  const { getClient } = useAlchemyClient();
  const config = useAlchemyConfig();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SendTransactionResult | null>(null);

  const sendTransaction = useCallback(
    async (
      input: UnsignedTransactionRequest | UnsignedTransactionRequest[],
      options?: SendTransactionOptions,
    ): Promise<SendTransactionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const { client, account } = await getClient();

        // Determine if transaction should be sponsored
        const hasPolicyId = !!config.policyId;
        const enableSponsorship = !config.disableSponsorship;
        const shouldSponsor =
          options?.disableSponsorship !== undefined
            ? !options.disableSponsorship
            : hasPolicyId && enableSponsorship;

        // Format the transaction call(s)
        const inputs = Array.isArray(input) ? input : [input];
        const formattedCalls = inputs.map((txn) => ({
          to: txn.to,
          data: txn.data,
          value: txn.value ? normalizeValue(txn.value) : undefined,
        }));

        // Build capabilities based on sponsorship and auth mode
        const policyId = Array.isArray(config.policyId)
          ? config.policyId[0]
          : config.policyId;

        type Capabilities =
          | { eip7702Auth: true; paymasterService?: { policyId: string } }
          | { paymasterService?: { policyId: string } };
        const capabilities: Capabilities =
          config.accountAuthMode === "eip7702" ? { eip7702Auth: true } : {};

        if (shouldSponsor && policyId) {
          capabilities.paymasterService = { policyId };
        }

        // Send the transaction(s) from the smart account address
        const result = await client.sendCalls({
          from: account.address,
          calls: formattedCalls,
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
    [
      getClient,
      config.policyId,
      config.disableSponsorship,
      config.accountAuthMode,
    ],
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
