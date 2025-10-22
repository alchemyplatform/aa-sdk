import type { Address, Hash, Hex } from "viem";
import type { swapActions } from "@account-kit/wallet-client/experimental";
import { ConnectionConfigSchema } from "@aa-sdk/core";
import type { z } from "zod";

/**
 * Configuration for the Alchemy provider
 * Uses ConnectionConfigSchema to ensure valid transport configuration
 */
export type AlchemyProviderConfig = z.infer<typeof ConnectionConfigSchema> & {
  /** Policy ID(s) for EVM gas sponsorship */
  policyId?: string | string[];

  /** Policy ID(s) for Solana gas sponsorship */
  solanaPolicyId?: string | string[];

  /** Solana RPC URL (separate from EVM rpcUrl) */
  solanaRpcUrl?: string;

  /**
   * How EVM smart account calls should be authorized.
   * - 'eip7702' (default): delegated authorization via EIP-7702.
   * - 'owner': sign as the account owner (Privy embedded wallet), no 7702.
   */
  accountAuthMode?: "eip7702" | "owner";

  /**
   * Set to true to disable gas sponsorship by default
   * Default: false (sponsorship enabled when policyId is provided)
   */
  disableSponsorship?: boolean;
};

/**
 * Unsigned transaction request
 */
export interface UnsignedTransactionRequest {
  /** Recipient address */
  to: Address;

  /** Transaction data (calldata) */
  data?: Hex;

  /** Transaction value - accepts string | number | bigint */
  value?: string | number | bigint;
}

/**
 * Options for sending a transaction
 */
export interface SendTransactionOptions {
  /**
   * Set to true to disable sponsorship for this specific transaction
   * Default: false (follows provider's disableSponsorship setting)
   */
  disableSponsorship?: boolean;
}

/**
 * Result of a successful transaction
 */
export interface SendTransactionResult {
  /** EVM transaction hash (first receipt hash) */
  txnHash: Hash;
}

/**
 * Hook result for sending transactions
 */
export interface UseSendTransactionResult {
  /** Whether the transaction is currently being sent */
  isLoading: boolean;

  /** Error if transaction failed */
  error: Error | null;

  /** Transaction result if successful */
  data: SendTransactionResult | null;

  /** Reset the hook state */
  reset(): void;

  /** Send a single transaction or batch of transactions */
  sendTransaction(
    input: UnsignedTransactionRequest | UnsignedTransactionRequest[],
    options?: SendTransactionOptions,
  ): Promise<SendTransactionResult>;
}

/**
 * Request parameters for preparing a swap
 * Derived directly from the SDK to ensure type safety
 *
 * Note: Provide either `fromAmount` OR `minimumToAmount`, not both.
 * - Use `fromAmount` to specify exact amount to swap FROM
 * - Use `minimumToAmount` to specify minimum amount to receive TO
 */
export type PrepareSwapRequest = Parameters<
  ReturnType<typeof swapActions>["requestQuoteV0"]
>[0];

/**
 * Response from requestQuoteV0
 * Derived directly from the SDK to ensure type safety
 */
export type RequestQuoteV0Result = Awaited<
  ReturnType<ReturnType<typeof swapActions>["requestQuoteV0"]>
>;

/**
 * Swap quote information extracted from prepared swap calls
 * Derived directly from the SDK response
 */
export type SwapQuote = NonNullable<RequestQuoteV0Result["quote"]>;

/**
 * Result of preparing a swap (full response from requestQuoteV0)
 * Contains quote and prepared calls ready for signing
 */
export type PrepareSwapResult = Extract<
  RequestQuoteV0Result,
  { rawCalls?: false | undefined }
>;

/**
 * Hook result for preparing swaps
 */
export interface UsePrepareSwapResult {
  /** Whether the swap is being prepared */
  isLoading: boolean;

  /** Error if preparation failed */
  error: Error | null;

  /** Prepared swap data if successful */
  data: PrepareSwapResult | null;

  /** Reset the hook state */
  reset(): void;

  /** Request a swap quote and prepare calls */
  prepareSwap(request: PrepareSwapRequest): Promise<PrepareSwapResult>;
}

/**
 * Result of submitting a swap
 * Simplified wrapper that extracts the transaction hash
 */
export interface SubmitSwapResult {
  /** Transaction hash of the swap */
  txnHash: Hash;
}

/**
 * Hook result for submitting swaps
 */
export interface UseSubmitSwapResult {
  /** Whether the swap is being submitted */
  isLoading: boolean;

  /** Error if submission failed */
  error: Error | null;

  /** Swap submission result if successful */
  data: SubmitSwapResult | null;

  /** Reset the hook state */
  reset(): void;

  /** Sign and submit prepared swap calls */
  submitSwap(preparedSwap: PrepareSwapResult): Promise<SubmitSwapResult>;
}
