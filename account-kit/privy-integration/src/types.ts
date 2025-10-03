import type { Address, Hash, Hex } from "viem";

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
 */
export interface PrepareSwapRequest {
  /** Address initiating the swap */
  from?: Address;

  /** Token address to swap from (use "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" for native token) */
  fromToken: Address;

  /** Token address to swap to (use "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" for native token) */
  toToken: Address;

  /** Minimum amount to receive in hex format (e.g., "0xde0b6b3a7640000" for 1 ETH in wei) */
  minimumToAmount: Hex;
}

/**
 * Swap quote information from Alchemy's swap API
 */
export interface SwapQuote {
  /** Amount being swapped from (hex string) */
  fromAmount: Hex;

  /** Minimum amount to receive (hex string) */
  minimumToAmount: Hex;

  /** Quote expiration timestamp as hex string (convert with parseInt(expiry, 16)) */
  expiry: Hex;

  /** Additional quote details */
  [key: string]: unknown;
}

/**
 * Prepared swap calls ready for signing
 * This matches the structure returned by requestQuoteV0
 */
export interface PreparedSwapCalls {
  /** Swap quote details */
  quote?: SwapQuote;

  /** Chain ID */
  chainId?: Hex;

  /** Call type */
  type?: string;

  /** Not raw calls */
  rawCalls?: false;

  /** Additional call data */
  [key: string]: unknown;
}

/**
 * Result of preparing a swap
 */
export interface PrepareSwapResult {
  /** Swap quote information */
  quote: SwapQuote;

  /** Prepared calls ready for signing */
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
 * Signed swap calls ready for submission
 */
export interface SignedSwapCalls {
  /** Signed call data */
  [key: string]: unknown;
}

/**
 * Result of submitting a swap
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
