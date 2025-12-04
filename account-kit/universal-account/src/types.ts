/**
 * Type definitions for @account-kit/universal-account
 *
 * These types define the interface for working with Particle Network's
 * Universal Accounts within Alchemy Account Kit.
 *
 * @see https://developers.particle.network/universal-accounts/cha/overview
 */

import type { Address } from "viem";

/**
 * Configuration for initializing a Universal Account
 */
export interface UniversalAccountConfig {
  /** Particle Network project ID from dashboard */
  projectId: string;
  /** Particle Network client key from dashboard */
  projectClientKey: string;
  /** Particle Network app UUID from dashboard */
  projectAppUuid: string;
  /** Trade configuration for swaps and transactions */
  tradeConfig?: TradeConfig;
}

/**
 * Trade configuration options
 */
export interface TradeConfig {
  /** Slippage tolerance in basis points (100 = 1%) */
  slippageBps?: number;
  /** Use PARTI token to pay for gas fees */
  universalGas?: boolean;
  /** Specify which primary tokens to use as source for swaps */
  usePrimaryTokens?: string[];
}

/**
 * Smart account options returned from Universal Account
 */
export interface SmartAccountOptions {
  /** Name of the smart account implementation */
  name: string;
  /** Version of the smart account */
  version: string;
  /** EOA address that owns the Universal Account */
  ownerAddress: Address;
  /** EVM Universal Account address */
  smartAccountAddress: Address;
  /** Solana Universal Account address */
  solanaSmartAccountAddress?: string;
  /** Sender address for transactions */
  senderAddress: Address;
  /** Sender Solana address */
  senderSolanaAddress?: string;
}

/**
 * Asset information for a specific token
 */
export interface AssetInfo {
  /** Token type identifier */
  tokenType: string;
  /** Current price in USD */
  price: number;
  /** Amount held */
  amount: string;
  /** Amount in USD */
  amountInUSD: number;
  /** Breakdown by chain */
  chainAggregation: ChainAssetInfo[];
}

/**
 * Asset information per chain
 */
export interface ChainAssetInfo {
  /** Chain ID */
  chainId: number;
  /** Token contract address */
  address: Address;
  /** Amount on this chain */
  amount: string;
  /** Amount in USD */
  amountInUSD: number;
  /** Raw amount (with decimals) */
  rawAmount: string;
  /** Token decimals */
  decimals: number;
}

/**
 * Primary assets response
 */
export interface PrimaryAssets {
  /** List of assets */
  assets: AssetInfo[];
  /** Total balance in USD */
  totalAmountInUSD: number;
}

/**
 * Token identifier for transactions
 */
export interface TokenIdentifier {
  /** Chain ID where the token exists */
  chainId: number;
  /** Token contract address (use 0x0...0 for native token) */
  address: Address;
}

/**
 * Expected token for universal transactions
 */
export interface ExpectToken {
  /** Token type (e.g., "ETH", "USDT") */
  type: string;
  /** Amount to expect */
  amount: string;
}

/**
 * Parameters for creating a transfer transaction
 */
export interface TransferTransactionParams {
  /** Token to transfer */
  token: TokenIdentifier;
  /** Amount to transfer (human-readable) */
  amount: string;
  /** Receiver address */
  receiver: Address;
}

/**
 * Parameters for creating a universal transaction
 */
export interface UniversalTransactionParams {
  /** Destination chain ID */
  chainId: number;
  /** Expected tokens on destination */
  expectTokens: ExpectToken[];
  /** Transactions to execute */
  transactions: TransactionRequest[];
}

/**
 * Parameters for creating a buy/swap transaction
 * Converts USD value from primary assets into a target token
 */
export interface BuyTransactionParams {
  /** Target token to buy */
  token: TokenIdentifier;
  /** Amount in USD to spend */
  amountInUSD: string;
}

/**
 * Parameters for creating a sell transaction
 * Sells a token back into primary assets
 */
export interface SellTransactionParams {
  /** Token to sell */
  token: TokenIdentifier;
  /** Amount of token to sell (human-readable) */
  amount: string;
}

/**
 * Parameters for creating a convert transaction
 * Converts between primary assets on a specific chain
 */
export interface ConvertTransactionParams {
  /** Target token to convert to */
  expectToken: ExpectToken;
  /** Destination chain ID */
  chainId: number;
}

/**
 * Transaction request for universal transactions
 */
export interface TransactionRequest {
  /** Target contract address */
  to: Address;
  /** Encoded function data */
  data: `0x${string}`;
  /** Value to send (in wei, hex encoded) */
  value?: `0x${string}`;
}

/**
 * Universal transaction object returned from create methods
 */
export interface UniversalTransaction {
  /** Transaction type */
  type: "universal";
  /** Network mode */
  mode: "mainnet" | "testnet";
  /** Sender address */
  sender: Address;
  /** Receiver address */
  receiver: Address;
  /** Transaction ID */
  transactionId: string;
  /** Root hash to sign */
  rootHash: `0x${string}`;
  /** Smart account options */
  smartAccountOptions: SmartAccountOptions;
  /** Fee quotes */
  feeQuotes: FeeQuote[];
}

/**
 * Fee quote for a transaction
 */
export interface FeeQuote {
  fees: {
    totals: {
      feeTokenAmountInUSD: string;
      gasFeeTokenAmountInUSD: string;
      transactionServiceFeeTokenAmountInUSD: string;
      transactionLPFeeTokenAmountInUSD: string;
    };
    freeGasFee: boolean;
    freeServiceFee: boolean;
  };
}

/**
 * Result from sending a transaction
 */
export interface TransactionResult {
  /** Unique transaction ID */
  transactionId: string;
  /** Transaction status */
  status: string;
  /** Transaction mode */
  mode: "mainnet" | "testnet";
  /** Sender address */
  sender: Address;
  /** Receiver address */
  receiver: Address;
  /** Transaction tag (buy, swap, transfer, etc.) */
  tag: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Universal Account instance interface
 */
export interface IUniversalAccount {
  /** Get smart account options/addresses */
  getSmartAccountOptions(): Promise<SmartAccountOptions>;
  /** Get primary assets (unified balance) */
  getPrimaryAssets(): Promise<PrimaryAssets>;
  /** Create a transfer transaction */
  createTransferTransaction(
    params: TransferTransactionParams,
  ): Promise<UniversalTransaction>;
  /** Create a universal transaction */
  createUniversalTransaction(
    params: UniversalTransactionParams,
  ): Promise<UniversalTransaction>;
  /** Create a buy/swap transaction */
  createBuyTransaction(
    params: BuyTransactionParams,
  ): Promise<UniversalTransaction>;
  /** Create a sell transaction */
  createSellTransaction(
    params: SellTransactionParams,
  ): Promise<UniversalTransaction>;
  /** Create a convert transaction */
  createConvertTransaction(
    params: ConvertTransactionParams,
  ): Promise<UniversalTransaction>;
  /** Send a signed transaction */
  sendTransaction(
    transaction: UniversalTransaction,
    signature: string,
  ): Promise<TransactionResult>;
}
