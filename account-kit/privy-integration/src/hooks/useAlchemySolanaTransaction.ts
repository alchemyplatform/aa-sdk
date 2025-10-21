import { useCallback, useMemo, useState } from "react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useAlchemyConfig } from "../context/AlchemyContext.js";
import { createSolanaSponsoredTransaction } from "../util/createSolanaSponsoredTransaction.js";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import { createSolanaTransaction } from "../util/createSolanaTransaction.js";

/**
 * Type helper for values that can be synchronous or asynchronous
 *
 * @template T - The value type
 */
export type PromiseOrValue<T> = T | Promise<T>;

/**
 * Callback to modify a transaction before it's signed
 * Useful for adding additional signatures or metadata
 *
 * @param transaction - The unsigned transaction to modify
 * @returns The modified transaction
 */
export type PreSend = (
  this: void,
  transaction: VersionedTransaction | Transaction,
) => PromiseOrValue<VersionedTransaction | Transaction>;

/**
 * Callback to transform instructions into a custom transaction
 * Useful for advanced transaction construction (e.g., multi-sig, custom versioning)
 *
 * @param instructions - Array of Solana transaction instructions
 * @returns Constructed transaction (legacy or versioned)
 */
export type TransformInstruction = (
  this: void,
  instructions: TransactionInstruction[],
) => PromiseOrValue<Transaction | VersionedTransaction>;

/**
 * Optional transaction lifecycle hooks for advanced use cases
 */
export type SolanaTransactionParamOptions = {
  /** Hook called before signing the transaction */
  preSend?: PreSend;
  /** Custom transaction builder from instructions */
  transformInstruction?: TransformInstruction;
};

/**
 * Parameters for sending a Solana transaction
 * Supports either a simple transfer or custom instructions
 */
export type SolanaTransactionParams =
  | {
      /** Simple SOL transfer parameters */
      transfer: {
        /** Amount in lamports (accepts number or bigint) */
        amount: number | bigint;
        /** Recipient's base58-encoded address */
        toAddress: string;
      };
      /** Optional transaction lifecycle hooks */
      transactionComponents?: SolanaTransactionParamOptions;
      /** Options for confirming the transaction on-chain */
      confirmationOptions?: Parameters<Connection["confirmTransaction"]>[1];
    }
  | {
      /** Custom Solana transaction instructions */
      instructions: TransactionInstruction[];
      /** Optional transaction lifecycle hooks */
      transactionComponents?: SolanaTransactionParamOptions;
      /** Options for confirming the transaction on-chain */
      confirmationOptions?: Parameters<Connection["confirmTransaction"]>[1];
    };

/**
 * Result of a successful Solana transaction
 */
export interface SolanaTransactionResult {
  /** Base58-encoded transaction signature (hash) */
  hash: string;
}

/**
 * Configuration options for useAlchemySolanaTransaction hook
 */
export interface UseAlchemySolanaTransactionOptions {
  /** Solana RPC URL (overrides provider config) */
  rpcUrl?: string;
  /** Gas sponsorship policy ID (overrides provider config) */
  policyId?: string | void;
  /** Transaction confirmation options */
  confirmationOptions?: Parameters<Connection["confirmTransaction"]>[1];
  /** Specific wallet address to use (defaults to first available wallet) */
  walletAddress?: string;
}

/**
 * Return type of useAlchemySolanaTransaction hook
 */
export interface UseAlchemySolanaTransactionResult {
  /** Active Solana connection instance */
  readonly connection: Connection | null;
  /** Transaction result if successful */
  readonly data: void | SolanaTransactionResult;
  /** Whether a transaction is currently being sent */
  readonly isPending: boolean;
  /** Error if transaction failed */
  readonly error: Error | null;
  /** Reset hook state (clears error, data, isPending) */
  reset(): void;
  /** Send transaction (fire-and-forget, errors caught internally) */
  sendTransaction(params: SolanaTransactionParams): void;
  /** Send transaction and await result (throws on error) */
  sendTransactionAsync(
    params: SolanaTransactionParams,
  ): Promise<SolanaTransactionResult>;
}

/**
 * Hook to send Solana transactions with optional gas sponsorship via Alchemy
 * Works with Privy's Solana wallet integration for signing transactions
 * Supports both simple transfers and custom instruction sets
 *
 * @param {UseAlchemySolanaTransactionOptions} [opts] - Configuration options
 * @param {string} [opts.rpcUrl] - Solana RPC URL (overrides provider config)
 * @param {string} [opts.policyId] - Gas sponsorship policy ID (overrides provider config)
 * @param {string} [opts.walletAddress] - Specific wallet address to use (defaults to first wallet)
 * @param {Parameters<Connection["confirmTransaction"]>[1]} [opts.confirmationOptions] - Transaction confirmation options
 * @returns {UseAlchemySolanaTransactionResult} Hook result with transaction functions and state
 *
 * @example Simple SOL transfer
 * ```tsx
 * const { sendTransactionAsync, isPending, error, data } = useAlchemySolanaTransaction({
 *   rpcUrl: 'https://solana-mainnet.g.alchemy.com/v2/your-api-key',
 *   policyId: 'your-policy-id', // Optional: for gas sponsorship
 * });
 *
 * const handleTransfer = async () => {
 *   try {
 *     const result = await sendTransactionAsync({
 *       transfer: {
 *         amount: 1_000_000_000, // 1 SOL in lamports
 *         toAddress: 'recipient-address',
 *       },
 *     });
 *     console.log('Transaction hash:', result.hash);
 *   } catch (err) {
 *     console.error('Transaction failed:', err);
 *   }
 * };
 * ```
 *
 * @example Custom instructions
 * ```tsx
 * import { SystemProgram, PublicKey } from '@solana/web3.js';
 *
 * const { sendTransactionAsync } = useAlchemySolanaTransaction();
 *
 * // Build your custom instructions
 * const transferIx = SystemProgram.transfer({
 *   fromPubkey: new PublicKey(walletAddress),
 *   toPubkey: new PublicKey(recipientAddress),
 *   lamports: 1_000_000,
 * });
 *
 * // Pass instructions array to the hook
 * const result = await sendTransactionAsync({
 *   instructions: [transferIx],
 * });
 * ```
 *
 * @example With provider configuration
 * ```tsx
 * // In your provider setup
 * <AlchemyProvider
 *   solanaRpcUrl="https://solana-mainnet.g.alchemy.com/v2/..."
 *   solanaPolicyId="your-solana-policy-id"
 * >
 *   <YourApp />
 * </AlchemyProvider>
 *
 * // In your component - uses provider config automatically
 * const { sendTransactionAsync } = useAlchemySolanaTransaction();
 * ```
 */
export function useAlchemySolanaTransaction(
  opts: UseAlchemySolanaTransactionOptions = {},
): UseAlchemySolanaTransactionResult {
  const config = useAlchemyConfig();
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();

  // Resolve the Privy Solana wallet to use
  const embeddedWallet = useMemo(() => {
    if (opts.walletAddress) {
      const w = wallets.find((w) => w.address === opts.walletAddress);
      if (!w) throw new Error("Specified Solana wallet not found");
      return w;
    }
    return wallets[0];
  }, [wallets, opts.walletAddress]);

  // Build Solana connection from rpcUrl (hook override or provider default)
  const connection = useMemo(() => {
    const url = opts.rpcUrl || config.solanaRpcUrl;
    return url ? new Connection(url) : null;
  }, [opts.rpcUrl, config.solanaRpcUrl]);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<void | SolanaTransactionResult>(undefined);

  const resolvedPolicyId = useMemo(() => {
    if (opts.policyId != null) return opts.policyId || undefined;
    // Use solanaPolicyId from config, fallback to policyId for backwards compat
    const configPolicy = config.solanaPolicyId || config.policyId;
    return Array.isArray(configPolicy) ? configPolicy[0] : configPolicy;
  }, [opts.policyId, config.solanaPolicyId, config.policyId]);

  const mapTransformInstructions = useMemo(() => {
    const addSponsorship: TransformInstruction = async (instructions) => {
      const policyId = resolvedPolicyId;
      if (!policyId)
        throw new Error(
          "Gas sponsorship requires a policyId (see provider or hook options).",
        );
      const localConnection = connection || missing("connection");
      const fromAddress = embeddedWallet?.address;
      if (!fromAddress) throw new Error("No embedded Solana wallet connected");
      return createSolanaSponsoredTransaction(
        instructions,
        localConnection,
        policyId,
        fromAddress,
      );
    };
    const createTx: TransformInstruction = async (instructions) => {
      const localConnection = connection || missing("connection");
      const fromAddress = embeddedWallet?.address;
      if (!fromAddress) throw new Error("No embedded Solana wallet connected");
      return createSolanaTransaction(
        instructions,
        localConnection,
        fromAddress,
      );
    };
    const defaultTransform =
      !!resolvedPolicyId && !config.disableSponsorship
        ? addSponsorship
        : createTx;
    return {
      addSponsorship,
      createTransaction: createTx,
      default: defaultTransform,
    } as const;
  }, [
    resolvedPolicyId,
    config.disableSponsorship,
    connection,
    embeddedWallet?.address,
  ]);

  const buildInstructions = useCallback(
    (
      params: SolanaTransactionParams,
      fromAddress: string,
    ): TransactionInstruction[] => {
      if ("instructions" in params) return params.instructions;
      return [
        SystemProgram.transfer({
          fromPubkey: new PublicKey(fromAddress),
          toPubkey: new PublicKey(params.transfer.toAddress),
          lamports:
            typeof params.transfer.amount === "bigint"
              ? Number(params.transfer.amount) // web3.js currently expects number; callers can pass bigint safely
              : params.transfer.amount,
        }),
      ];
    },
    [],
  );

  function toUnsignedBytes(tx: VersionedTransaction | Transaction): Uint8Array {
    // Serialize the full transaction structure (with placeholder signatures)
    // Privy expects the complete transaction format, not just the message
    if (tx instanceof VersionedTransaction) {
      // VersionedTransaction.serialize() includes signature slots
      return tx.serialize();
    }
    // Legacy Transaction: serialize without requiring all signatures
    const buf = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  }

  const sendTransactionAsync = useCallback(
    async (
      params: SolanaTransactionParams,
    ): Promise<SolanaTransactionResult> => {
      setIsPending(true);
      setError(null);
      try {
        const localConnection = connection || missing("connection");
        if (!embeddedWallet?.address) {
          throw new Error("No Solana wallet connected via Privy");
        }

        const fromAddress = embeddedWallet.address;
        const {
          transactionComponents: { preSend, transformInstruction } = {},
          confirmationOptions,
        } = params;

        const instructions = buildInstructions(params, fromAddress);

        let transaction: VersionedTransaction | Transaction;
        if (transformInstruction) {
          transaction = await transformInstruction(instructions);
        } else {
          transaction = await mapTransformInstructions.default(instructions);
        }

        transaction = (await preSend?.(transaction)) || transaction;

        // Sign the transaction using Privy's useSignTransaction hook
        const unsignedBytes = toUnsignedBytes(transaction);
        const { signedTransaction } = await signTransaction({
          transaction: unsignedBytes,
          wallet: embeddedWallet,
        });

        // Broadcast the signed transaction
        const hash = await localConnection.sendRawTransaction(
          signedTransaction,
          { skipPreflight: false },
        );

        if (confirmationOptions || opts.confirmationOptions) {
          await localConnection.confirmTransaction(
            hash,
            confirmationOptions || opts.confirmationOptions,
          );
        }

        setData({ hash });
        return { hash };
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [
      embeddedWallet,
      connection,
      buildInstructions,
      mapTransformInstructions,
      opts.confirmationOptions,
      signTransaction,
    ],
  );

  const sendTransaction = useCallback(
    (params: SolanaTransactionParams) => {
      // Prevent unhandled rejection warnings; error state is already set in sendTransactionAsync
      sendTransactionAsync(params).catch(() => {});
    },
    [sendTransactionAsync],
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setError(null);
    setData(undefined);
  }, []);

  return {
    connection,
    data,
    isPending,
    error,
    reset,
    sendTransaction,
    sendTransactionAsync,
  };
}

function missing(message: string): never {
  throw new Error(message);
}
