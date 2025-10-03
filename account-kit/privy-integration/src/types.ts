import type { Address, Hash, Hex } from "viem";
import type { swapActions } from "@account-kit/wallet-client/experimental";

/**
 * Configuration for the Alchemy provider
 */
export interface AlchemyProviderConfig {
  /** Alchemy API key for @account-kit/infra transport */
  apiKey?: string;

  /** JWT token for authentication */
  jwt?: string;

  /** Custom RPC URL */
  url?: string;

  /** Policy ID(s) for gas sponsorship */
  policyId?: string | string[];

  /**
   * Default: true → try to sponsor via Alchemy Gas Manager
   * Set to false to disable sponsorship by default
   */
  defaultSponsored?: boolean;
}

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
   * Whether to sponsor the transaction
   * Default: true if policy ID exists and defaultSponsored is not set to false
   */
  sponsored?: boolean;
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

  /** Send a transaction */
  sendTransaction(
    input: UnsignedTransactionRequest,
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
 * Prepared swap calls ready for signing
 * Excludes the rawCalls variant since we validate against it
 */
export type PreparedSwapCalls = Extract<
  RequestQuoteV0Result,
  { rawCalls?: false | undefined }
>;

/**
 * Result of preparing a swap
 * Separates quote from prepared calls for cleaner API
 */
export interface PrepareSwapResult {
  /** Swap quote information */
  quote: SwapQuote;

  /** Prepared calls ready for signing (full response from requestQuoteV0) */
  preparedCalls: PreparedSwapCalls;
}

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
  submitSwap(preparedCalls: PreparedSwapCalls): Promise<SubmitSwapResult>;
}
