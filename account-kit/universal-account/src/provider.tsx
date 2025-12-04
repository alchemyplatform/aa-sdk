"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Address } from "viem";
import {
  UniversalAccountClient,
  createUniversalAccountClient,
} from "./client.js";
import type {
  UniversalAccountConfig,
  PrimaryAssets,
  TransferTransactionParams,
  UniversalTransactionParams,
  BuyTransactionParams,
  SellTransactionParams,
  ConvertTransactionParams,
  UniversalTransaction,
  TransactionResult,
} from "./types.js";

/**
 * Configuration for Universal Accounts - simplified for seamless integration
 */
export interface UniversalAccountProviderConfig {
  /** Particle Network project ID */
  projectId: string;
  /** Particle Network client key */
  clientKey: string;
  /** Particle Network app ID */
  appId: string;
  /** Optional trade configuration */
  tradeConfig?: {
    /** Slippage tolerance in basis points (100 = 1%) */
    slippageBps?: number;
    /** Use PARTI token for gas fees */
    universalGas?: boolean;
  };
}

/**
 * Props for UniversalAccountProvider
 */
export interface UniversalAccountProviderProps {
  children: ReactNode;
  /** Universal Account configuration */
  config: UniversalAccountProviderConfig;
}

/**
 * Context value for Universal Account
 */
export interface UniversalAccountContextValue {
  /** The Universal Account client instance */
  client: UniversalAccountClient | null;
  /** Whether the client is currently initializing */
  isInitializing: boolean;
  /** Whether the client is ready to use */
  isReady: boolean;
  /** Error if initialization failed */
  error: Error | null;
  /** EVM Universal Account address */
  address: Address | null;
  /** Solana Universal Account address */
  solanaAddress: string | null;
  /** Initialize the UA with an owner address */
  initialize: (ownerAddress: Address) => Promise<void>;
  /** Reset/disconnect the UA */
  disconnect: () => void;
}

const UniversalAccountContext =
  createContext<UniversalAccountContextValue | null>(null);

/**
 * Provider component for Universal Account integration
 *
 * Wrap your app with this provider to enable Universal Account functionality.
 * The UA will auto-initialize when you call `initialize` with the owner address.
 *
 * @param {UniversalAccountProviderProps} props - Provider props
 * @param {ReactNode} props.children - Child components
 * @param {UniversalAccountProviderConfig} props.config - UA configuration
 * @returns {JSX.Element} Provider component
 *
 * @example
 * ```tsx
 * import { UniversalAccountProvider } from "@account-kit/universal-account";
 *
 * function App() {
 *   return (
 *     <UniversalAccountProvider
 *       config={{
 *         projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
 *         clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
 *         appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
 *       }}
 *     >
 *       <YourApp />
 *     </UniversalAccountProvider>
 *   );
 * }
 * ```
 */
export function UniversalAccountProvider({
  children,
  config,
}: UniversalAccountProviderProps): JSX.Element {
  const [client, setClient] = useState<UniversalAccountClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  const initialize = useCallback(
    async (ownerAddress: Address) => {
      if (!ownerAddress) return;

      setIsInitializing(true);
      setError(null);

      try {
        const uaConfig: UniversalAccountConfig = {
          projectId: config.projectId,
          projectClientKey: config.clientKey,
          projectAppUuid: config.appId,
          tradeConfig: config.tradeConfig,
        };

        const uaClient = await createUniversalAccountClient({
          ownerAddress,
          config: uaConfig,
        });

        // Fetch addresses
        const [evmAddr, solAddr] = await Promise.all([
          uaClient.getAddress(),
          uaClient.getSolanaAddress(),
        ]);

        setClient(uaClient);
        setAddress(evmAddr);
        setSolanaAddress(solAddr ?? null);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to initialize Universal Account");
        setError(error);
        console.error("Universal Account initialization failed:", err);
      } finally {
        setIsInitializing(false);
      }
    },
    [config],
  );

  const disconnect = useCallback(() => {
    setClient(null);
    setAddress(null);
    setSolanaAddress(null);
    setError(null);
  }, []);

  const value = useMemo<UniversalAccountContextValue>(
    () => ({
      client,
      isInitializing,
      isReady: client !== null && !isInitializing,
      error,
      address,
      solanaAddress,
      initialize,
      disconnect,
    }),
    [
      client,
      isInitializing,
      error,
      address,
      solanaAddress,
      initialize,
      disconnect,
    ],
  );

  return (
    <UniversalAccountContext.Provider value={value}>
      {children}
    </UniversalAccountContext.Provider>
  );
}

/**
 * Hook to access Universal Account context
 *
 * @returns {UniversalAccountContextValue} The Universal Account context
 * @throws Error if used outside of UniversalAccountProvider
 */
export function useUniversalAccountContext(): UniversalAccountContextValue {
  const context = useContext(UniversalAccountContext);
  if (!context) {
    throw new Error(
      "useUniversalAccountContext must be used within a UniversalAccountProvider",
    );
  }
  return context;
}

/**
 * Hook to get the Universal Account client and auto-initialize with Account Kit
 *
 * This hook automatically initializes the Universal Account when the user
 * is authenticated with Account Kit. Just provide the owner address from
 * Account Kit's useAccount or useSigner hooks.
 *
 * @param {Address | null} [ownerAddress] - The EOA address that owns the Universal Account
 * @returns {UniversalAccountContextValue} The Universal Account context with client and state
 *
 * @example
 * ```tsx
 * import { useUniversalAccount } from "@account-kit/universal-account";
 * import { useAccount } from "@account-kit/react";
 *
 * function MyComponent() {
 *   const { address: ownerAddress } = useAccount({ type: "LightAccount" });
 *   const { client, address, isReady, error } = useUniversalAccount(ownerAddress);
 *
 *   if (!isReady) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>UA Address: {address}</div>;
 * }
 * ```
 */
export function useUniversalAccount(
  ownerAddress?: Address | null,
): UniversalAccountContextValue {
  const context = useUniversalAccountContext();
  const { initialize, client, isInitializing } = context;

  // Auto-initialize when owner address is available
  useEffect(() => {
    if (ownerAddress && !client && !isInitializing) {
      initialize(ownerAddress);
    }
  }, [ownerAddress, client, isInitializing, initialize]);

  // Disconnect when owner address is removed
  useEffect(() => {
    if (!ownerAddress && client) {
      context.disconnect();
    }
  }, [ownerAddress, client, context]);

  return context;
}

/**
 * Hook to get unified balance across all chains
 *
 * @param {object} [options] - Options for the hook
 * @param {number} [options.refetchInterval] - Auto-refresh interval in milliseconds
 * @returns {object} Balance state and refetch function
 *
 * @example
 * ```tsx
 * import { useUnifiedBalance } from "@account-kit/universal-account";
 *
 * function BalanceDisplay() {
 *   const { totalBalanceUSD, assets, isLoading, refetch } = useUnifiedBalance();
 *
 *   return (
 *     <div>
 *       <h2>Total: ${totalBalanceUSD?.toFixed(2)}</h2>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUnifiedBalance(options?: { refetchInterval?: number }): {
  balance: PrimaryAssets | null;
  totalBalanceUSD: number | null;
  assets: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { client, isReady } = useUniversalAccountContext();
  const [balance, setBalance] = useState<PrimaryAssets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const assets = await client.getPrimaryAssets();
      setBalance(assets);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch balance"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Initial fetch when client is ready
  useEffect(() => {
    if (isReady && client) {
      fetchBalance();
    }
  }, [isReady, client, fetchBalance]);

  // Optional auto-refresh
  useEffect(() => {
    if (!options?.refetchInterval || !isReady) return;

    const interval = setInterval(fetchBalance, options.refetchInterval);
    return () => clearInterval(interval);
  }, [options?.refetchInterval, isReady, fetchBalance]);

  return {
    balance,
    totalBalanceUSD: balance?.totalAmountInUSD ?? null,
    assets: balance?.assets ?? null,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Options for transaction callbacks
 */
interface TransactionCallbackOptions {
  /** Called when the transaction is created (before signing) */
  onTransactionCreated?: (tx: UniversalTransaction) => void;
}

/**
 * Hook to send Universal Account transactions
 *
 * Provides methods for all transaction types supported by Universal Accounts:
 * - `sendTransfer` - Send tokens to any address
 * - `sendUniversal` - Execute custom contract interactions
 * - `sendBuy` - Buy/swap into a target token using USD value
 * - `sendSell` - Sell a token back into primary assets
 * - `sendConvert` - Convert between primary assets on a chain
 *
 * @param {object} options - Options for the hook
 * @param {Function} options.signMessage - Function to sign messages with the owner wallet
 * @returns {object} Transaction functions and state
 *
 * @example
 * ```tsx
 * import { useSendTransaction } from "@account-kit/universal-account";
 * import { useSigner } from "@account-kit/react";
 * import { toBytes } from "viem";
 *
 * function TransactionButtons() {
 *   const signer = useSigner();
 *   const {
 *     sendTransfer,
 *     sendUniversal,
 *     sendBuy,
 *     sendSell,
 *     sendConvert,
 *     isLoading
 *   } = useSendTransaction({
 *     signMessage: (msg) => signer!.signMessage({ raw: toBytes(msg) }),
 *   });
 *
 *   // Transfer tokens
 *   const handleTransfer = () => sendTransfer({
 *     token: { chainId: 42161, address: "0x..." },
 *     amount: "10",
 *     receiver: "0x...",
 *   });
 *
 *   // Buy $10 worth of a token
 *   const handleBuy = () => sendBuy({
 *     token: { chainId: 42161, address: "0x..." },
 *     amountInUSD: "10",
 *   });
 *
 *   // Sell tokens
 *   const handleSell = () => sendSell({
 *     token: { chainId: 42161, address: "0x..." },
 *     amount: "0.1",
 *   });
 *
 *   // Convert to USDC on Arbitrum
 *   const handleConvert = () => sendConvert({
 *     expectToken: { type: "USDC", amount: "1" },
 *     chainId: 42161,
 *   });
 * }
 * ```
 */
export function useSendTransaction(options: {
  signMessage: (message: string) => Promise<string>;
}) {
  const { client, isReady } = useUniversalAccountContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<TransactionResult | null>(null);

  /**
   * Helper to execute a transaction with signing
   */
  const executeTransaction = useCallback(
    async (
      createTx: () => Promise<UniversalTransaction>,
      callbacks?: TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      if (!client) {
        throw new Error("Universal Account not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        const tx = await createTx();
        callbacks?.onTransactionCreated?.(tx);

        const signature = await options.signMessage(tx.rootHash);
        const result = await client.sendTransaction(tx, signature);

        setLastResult(result);
        return result;
      } catch (err) {
        const txError =
          err instanceof Error ? err : new Error("Transaction failed");
        setError(txError);
        throw txError;
      } finally {
        setIsLoading(false);
      }
    },
    [client, options],
  );

  /**
   * Send a token transfer
   */
  const sendTransfer = useCallback(
    async (
      params: TransferTransactionParams & TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      return executeTransaction(
        () => client!.createTransferTransaction(params),
        params,
      );
    },
    [client, executeTransaction],
  );

  /**
   * Send a custom universal transaction (contract interactions)
   */
  const sendUniversal = useCallback(
    async (
      params: UniversalTransactionParams & TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      return executeTransaction(
        () => client!.createUniversalTransaction(params),
        params,
      );
    },
    [client, executeTransaction],
  );

  /**
   * Buy/swap into a target token using USD value from primary assets
   */
  const sendBuy = useCallback(
    async (
      params: BuyTransactionParams & TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      return executeTransaction(
        () => client!.createBuyTransaction(params),
        params,
      );
    },
    [client, executeTransaction],
  );

  /**
   * Sell a token back into primary assets
   */
  const sendSell = useCallback(
    async (
      params: SellTransactionParams & TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      return executeTransaction(
        () => client!.createSellTransaction(params),
        params,
      );
    },
    [client, executeTransaction],
  );

  /**
   * Convert between primary assets on a specific chain
   */
  const sendConvert = useCallback(
    async (
      params: ConvertTransactionParams & TransactionCallbackOptions,
    ): Promise<TransactionResult> => {
      return executeTransaction(
        () => client!.createConvertTransaction(params),
        params,
      );
    },
    [client, executeTransaction],
  );

  return {
    /** Send a token transfer */
    sendTransfer,
    /** Send a custom contract interaction */
    sendUniversal,
    /** Buy/swap into a target token */
    sendBuy,
    /** Sell a token back into primary assets */
    sendSell,
    /** Convert between primary assets */
    sendConvert,
    /** Whether a transaction is in progress */
    isLoading,
    /** Last error, if any */
    error,
    /** Result of the last transaction */
    lastResult,
    /** Whether the hook is ready to send transactions */
    isReady,
  };
}
