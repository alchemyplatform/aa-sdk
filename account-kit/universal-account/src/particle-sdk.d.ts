/**
 * Type declarations for @particle-network/universal-account-sdk
 * This file helps TypeScript resolve the module when the SDK's package.json exports
 * don't properly expose the type declarations.
 */
declare module "@particle-network/universal-account-sdk" {
  export interface UniversalAccountConfig {
    projectId: string;
    projectClientKey?: string;
    projectAppUuid?: string;
    ownerAddress: string;
    tradeConfig?: {
      slippageBps?: number;
      universalGas?: boolean;
      usePrimaryTokens?: string[];
    };
  }

  export interface SmartAccountOptions {
    name: string;
    version: string;
    ownerAddress: string;
    smartAccountAddress: string;
    solanaSmartAccountAddress?: string;
    senderAddress: string;
    senderSolanaAddress?: string;
  }

  export interface PrimaryAssets {
    assets: Array<{
      tokenType: string;
      price: number;
      amount: string;
      amountInUSD: number;
      chainAggregation?: Array<{
        token?: {
          chainId: number;
          address: string;
          decimals: number;
        };
        chainId?: number;
        address?: string;
        amount: string;
        amountInUSD: number;
        rawAmount: string;
        decimals?: number;
      }>;
    }>;
    totalAmountInUSD: number;
  }

  export interface TransferTransactionParams {
    token: {
      chainId: number;
      address: string;
    };
    amount: string;
    receiver: string;
  }

  export interface UniversalTransactionParams {
    chainId: number;
    expectTokens: Array<{
      type: string;
      amount: string;
    }>;
    transactions: Array<{
      to: string;
      data: string;
      value?: string;
    }>;
  }

  export interface UniversalTransaction {
    type: string;
    mode: string;
    sender: string;
    receiver: string;
    transactionId: string;
    rootHash: string;
    smartAccountOptions: SmartAccountOptions;
    feeQuotes: Array<{
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
    }>;
  }

  export interface TransactionResult {
    transactionId: string;
    status: string;
    mode: string;
    sender: string;
    receiver: string;
    tag: string;
    created_at: string;
    updated_at: string;
  }

  export class UniversalAccount {
    constructor(config: UniversalAccountConfig);
    getSmartAccountOptions(): Promise<SmartAccountOptions>;
    getPrimaryAssets(): Promise<PrimaryAssets>;
    createTransferTransaction(
      params: TransferTransactionParams
    ): Promise<UniversalTransaction>;
    createUniversalTransaction(
      params: UniversalTransactionParams
    ): Promise<UniversalTransaction>;
    sendTransaction(
      transaction: UniversalTransaction,
      signature: string
    ): Promise<TransactionResult>;
  }

  export const CHAIN_ID: {
    ETHEREUM_MAINNET: number;
    ARBITRUM_MAINNET_ONE: number;
    BASE_MAINNET: number;
    BSC_MAINNET: number;
    POLYGON_MAINNET: number;
    OPTIMISM_MAINNET: number;
    AVALANCHE_MAINNET: number;
    [key: string]: number;
  };

  export const SUPPORTED_TOKEN_TYPE: {
    ETH: string;
    USDT: string;
    USDC: string;
    BNB: string;
    SOL: string;
    MATIC: string;
    AVAX: string;
    [key: string]: string;
  };
}
