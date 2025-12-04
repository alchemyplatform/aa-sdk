import type { Address } from "viem";
import type {
  UniversalAccountConfig,
  SmartAccountOptions,
  PrimaryAssets,
  TransferTransactionParams,
  UniversalTransactionParams,
  BuyTransactionParams,
  SellTransactionParams,
  ConvertTransactionParams,
  UniversalTransaction,
  TransactionResult,
  IUniversalAccount,
} from "./types.js";

export interface CreateUniversalAccountClientParams {
  /** Owner EOA address that controls the Universal Account */
  ownerAddress: Address;
  /** Universal Account configuration */
  config: UniversalAccountConfig;
}

/**
 * Universal Account Client
 *
 * Wraps Particle Network's Universal Account SDK to provide
 * chain abstraction capabilities within Account Kit.
 *
 * @example
 * ```ts
 * import { createUniversalAccountClient } from "@account-kit/universal-account";
 *
 * const client = await createUniversalAccountClient({
 *   ownerAddress: "0x...",
 *   config: {
 *     projectId: "your-project-id",
 *     projectClientKey: "your-client-key",
 *     projectAppUuid: "your-app-uuid",
 *   },
 * });
 *
 * // Get unified balance across all chains
 * const balance = await client.getPrimaryAssets();
 * console.log("Total USD:", balance.totalAmountInUSD);
 * ```
 */
export class UniversalAccountClient implements IUniversalAccount {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ua: any;
  private _ownerAddress: Address;

  /**
   * Creates a new UniversalAccountClient instance
   *
   * @param {any} ua - The underlying Particle Universal Account instance
   * @param {Address} ownerAddress - The EOA address that owns this Universal Account
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(ua: any, ownerAddress: Address) {
    this.ua = ua;
    this._ownerAddress = ownerAddress;
  }

  /**
   * Get the owner EOA address
   *
   * @returns {Address} The owner EOA address
   */
  getOwnerAddress(): Address {
    return this._ownerAddress;
  }

  /**
   * Get smart account options including all addresses
   *
   * @returns {Promise<SmartAccountOptions>} Smart account options with EVM and Solana addresses
   */
  async getSmartAccountOptions(): Promise<SmartAccountOptions> {
    const options = await this.ua.getSmartAccountOptions();
    return {
      name: options.name,
      version: options.version,
      ownerAddress: options.ownerAddress as Address,
      smartAccountAddress: options.smartAccountAddress as Address,
      solanaSmartAccountAddress: options.solanaSmartAccountAddress,
      senderAddress: options.senderAddress as Address,
      senderSolanaAddress: options.senderSolanaAddress,
    };
  }

  /**
   * Get the EVM Universal Account address
   *
   * @returns {Promise<Address>} The EVM smart account address
   */
  async getAddress(): Promise<Address> {
    const options = await this.getSmartAccountOptions();
    return options.smartAccountAddress;
  }

  /**
   * Get the Solana Universal Account address
   *
   * @returns {Promise<string | undefined>} The Solana smart account address, if available
   */
  async getSolanaAddress(): Promise<string | undefined> {
    const options = await this.getSmartAccountOptions();
    return options.solanaSmartAccountAddress;
  }

  /**
   * Get primary assets (unified balance across all chains)
   *
   * @returns {Promise<PrimaryAssets>} Primary assets with total USD value
   *
   * @example
   * ```ts
   * const assets = await client.getPrimaryAssets();
   * console.log("Total balance:", assets.totalAmountInUSD);
   *
   * // Iterate through assets
   * for (const asset of assets.assets) {
   *   console.log(`${asset.tokenType}: $${asset.amountInUSD}`);
   * }
   * ```
   */
  async getPrimaryAssets(): Promise<PrimaryAssets> {
    const assets = await this.ua.getPrimaryAssets();
    return {
      assets: assets.assets.map((asset: any) => ({
        tokenType: asset.tokenType,
        price: asset.price,
        amount: asset.amount,
        amountInUSD: asset.amountInUSD,
        chainAggregation:
          asset.chainAggregation?.map((chain: any) => ({
            chainId: chain.token?.chainId ?? chain.chainId,
            address: chain.token?.address ?? chain.address,
            amount: chain.amount,
            amountInUSD: chain.amountInUSD,
            rawAmount: chain.rawAmount,
            decimals: chain.token?.decimals ?? chain.decimals,
          })) ?? [],
      })),
      totalAmountInUSD: assets.totalAmountInUSD,
    };
  }

  /**
   * Create a transfer transaction
   *
   * @param {TransferTransactionParams} params Transfer parameters
   * @returns {Promise<UniversalTransaction>} Universal transaction ready to be signed
   *
   * @example
   * ```ts
   * const tx = await client.createTransferTransaction({
   *   token: {
   *     chainId: 42161, // Arbitrum
   *     address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
   *   },
   *   amount: "10",
   *   receiver: "0x...",
   * });
   *
   * // Sign the rootHash with your signer
   * const signature = await signer.signMessage(tx.rootHash);
   *
   * // Send the transaction
   * const result = await client.sendTransaction(tx, signature);
   * ```
   */
  async createTransferTransaction(
    params: TransferTransactionParams,
  ): Promise<UniversalTransaction> {
    const tx = await this.ua.createTransferTransaction({
      token: {
        chainId: params.token.chainId,
        address: params.token.address,
      },
      amount: params.amount,
      receiver: params.receiver,
    });

    return this.mapTransaction(tx);
  }

  /**
   * Create a universal transaction for contract interactions
   *
   * @param {UniversalTransactionParams} params Universal transaction parameters
   * @returns {Promise<UniversalTransaction>} Universal transaction ready to be signed
   *
   * @example
   * ```ts
   * const tx = await client.createUniversalTransaction({
   *   chainId: 8453, // Base
   *   expectTokens: [
   *     { type: "ETH", amount: "0.01" },
   *   ],
   *   transactions: [
   *     {
   *       to: "0x...",
   *       data: "0x...",
   *       value: "0x...",
   *     },
   *   ],
   * });
   * ```
   */
  async createUniversalTransaction(
    params: UniversalTransactionParams,
  ): Promise<UniversalTransaction> {
    const tx = await this.ua.createUniversalTransaction({
      chainId: params.chainId,
      expectTokens: params.expectTokens.map((token) => ({
        type: token.type,
        amount: token.amount,
      })),
      transactions: params.transactions.map((txn) => ({
        to: txn.to,
        data: txn.data,
        value: txn.value,
      })),
    });

    return this.mapTransaction(tx);
  }

  /**
   * Create a buy/swap transaction
   *
   * Converts USD value from your primary assets into a target token.
   * The SDK will automatically route liquidity from your holdings.
   *
   * @param {BuyTransactionParams} params Buy transaction parameters
   * @returns {Promise<UniversalTransaction>} Universal transaction ready to be signed
   *
   * @example
   * ```ts
   * const tx = await client.createBuyTransaction({
   *   token: {
   *     chainId: 42161, // Arbitrum
   *     address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
   *   },
   *   amountInUSD: "10", // Buy $10 worth of USDT
   * });
   * ```
   */
  async createBuyTransaction(
    params: BuyTransactionParams,
  ): Promise<UniversalTransaction> {
    const tx = await this.ua.createBuyTransaction({
      token: {
        chainId: params.token.chainId,
        address: params.token.address,
      },
      amountInUSD: params.amountInUSD,
    });

    return this.mapTransaction(tx);
  }

  /**
   * Create a sell transaction
   *
   * Sells a token back into primary assets. Ensure the Universal Account
   * has enough balance of the token before calling.
   *
   * @param {SellTransactionParams} params Sell transaction parameters
   * @returns {Promise<UniversalTransaction>} Universal transaction ready to be signed
   *
   * @example
   * ```ts
   * const tx = await client.createSellTransaction({
   *   token: {
   *     chainId: 42161, // Arbitrum
   *     address: "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
   *   },
   *   amount: "0.1", // Sell 0.1 ARB
   * });
   * ```
   */
  async createSellTransaction(
    params: SellTransactionParams,
  ): Promise<UniversalTransaction> {
    const tx = await this.ua.createSellTransaction({
      token: {
        chainId: params.token.chainId,
        address: params.token.address,
      },
      amount: params.amount,
    });

    return this.mapTransaction(tx);
  }

  /**
   * Create a convert transaction
   *
   * Converts between primary assets on a specific chain.
   * Useful for converting assets directly to the target chain.
   *
   * @param {ConvertTransactionParams} params Convert transaction parameters
   * @returns {Promise<UniversalTransaction>} Universal transaction ready to be signed
   *
   * @example
   * ```ts
   * const tx = await client.createConvertTransaction({
   *   expectToken: { type: "USDC", amount: "1" },
   *   chainId: 42161, // Arbitrum
   * });
   * ```
   */
  async createConvertTransaction(
    params: ConvertTransactionParams,
  ): Promise<UniversalTransaction> {
    const tx = await this.ua.createConvertTransaction({
      expectToken: {
        type: params.expectToken.type,
        amount: params.expectToken.amount,
      },
      chainId: params.chainId,
    });

    return this.mapTransaction(tx);
  }

  /**
   * Send a signed transaction
   *
   * @param {UniversalTransaction} transaction The transaction to send
   * @param {string} signature The signature from signing the rootHash
   * @returns {Promise<TransactionResult>} Transaction result with ID and status
   *
   * @example
   * ```ts
   * const result = await client.sendTransaction(tx, signature);
   * console.log("Transaction ID:", result.transactionId);
   * console.log("Explorer:", `https://universalx.app/activity/details?id=${result.transactionId}`);
   * ```
   */
  async sendTransaction(
    transaction: UniversalTransaction,
    signature: string,
  ): Promise<TransactionResult> {
    // We need to pass the original transaction object from the SDK
    // The transaction parameter here is our mapped type, but we stored
    // the original in a way that sendTransaction can use it
    const result = await this.ua.sendTransaction(transaction as any, signature);

    return {
      transactionId: result.transactionId,
      status: result.status,
      mode: result.mode as "mainnet" | "testnet",
      sender: result.sender as Address,
      receiver: result.receiver as Address,
      tag: result.tag,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  /**
   * Get the explorer URL for a transaction
   *
   * @param {string} transactionId The transaction ID
   * @returns {string} UniversalX explorer URL
   */
  getExplorerUrl(transactionId: string): string {
    return `https://universalx.app/activity/details?id=${transactionId}`;
  }

  /**
   * Get the underlying Particle Universal Account instance.
   * Use this for advanced operations not covered by this wrapper.
   *
   * @returns {any} The underlying Particle SDK UniversalAccount instance
   */
  getUnderlyingAccount(): typeof this.ua {
    return this.ua;
  }

  private mapTransaction(tx: any): UniversalTransaction {
    return {
      ...tx,
      type: tx.type ?? "universal",
      mode: tx.mode ?? "mainnet",
      sender: tx.sender as Address,
      receiver: tx.receiver as Address,
      transactionId: tx.transactionId,
      rootHash: tx.rootHash as `0x${string}`,
      smartAccountOptions: {
        name: tx.smartAccountOptions?.name ?? "",
        version: tx.smartAccountOptions?.version ?? "",
        ownerAddress: tx.smartAccountOptions?.ownerAddress as Address,
        smartAccountAddress: tx.smartAccountOptions
          ?.smartAccountAddress as Address,
        solanaSmartAccountAddress:
          tx.smartAccountOptions?.solanaSmartAccountAddress,
        senderAddress: tx.smartAccountOptions?.senderAddress as Address,
        senderSolanaAddress: tx.smartAccountOptions?.senderSolanaAddress,
      },
      feeQuotes: tx.feeQuotes ?? [],
    };
  }
}

/**
 * Create a Universal Account client
 *
 * @param {CreateUniversalAccountClientParams} params Parameters for creating the client
 * @returns {Promise<UniversalAccountClient>} A configured Universal Account client
 *
 * @example
 * ```ts
 * import { createUniversalAccountClient } from "@account-kit/universal-account";
 *
 * const client = await createUniversalAccountClient({
 *   ownerAddress: userAddress,
 *   config: {
 *     projectId: process.env.PARTICLE_PROJECT_ID!,
 *     projectClientKey: process.env.PARTICLE_CLIENT_KEY!,
 *     projectAppUuid: process.env.PARTICLE_APP_UUID!,
 *     tradeConfig: {
 *       slippageBps: 100, // 1% slippage
 *       universalGas: true, // Use PARTI for gas
 *     },
 *   },
 * });
 * ```
 */
export async function createUniversalAccountClient(
  params: CreateUniversalAccountClientParams,
): Promise<UniversalAccountClient> {
  // Dynamic import to avoid bundling issues - users must install the peer dependency
  const { UniversalAccount } = await import(
    "@particle-network/universal-account-sdk"
  );

  const ua = new UniversalAccount({
    projectId: params.config.projectId,
    projectClientKey: params.config.projectClientKey,
    projectAppUuid: params.config.projectAppUuid,
    ownerAddress: params.ownerAddress,
    tradeConfig: params.config.tradeConfig
      ? {
          slippageBps: params.config.tradeConfig.slippageBps,
          universalGas: params.config.tradeConfig.universalGas,
          usePrimaryTokens: params.config.tradeConfig.usePrimaryTokens,
        }
      : undefined,
  });

  return new UniversalAccountClient(ua, params.ownerAddress);
}
