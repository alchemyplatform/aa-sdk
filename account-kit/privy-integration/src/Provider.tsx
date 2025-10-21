import {
  type PropsWithChildren,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import type { SmartContractAccount } from "@aa-sdk/core";
import type { AlchemyProviderConfig } from "./types.js";

/**
 * Normalized config with defaults applied
 *
 * @internal
 */
export type NormalizedAlchemyConfig = AlchemyProviderConfig &
  Required<Pick<AlchemyProviderConfig, "accountAuthMode">>;

const AlchemyContext = createContext<NormalizedAlchemyConfig | null>(null);

/**
 * Client cache stored in React tree (similar to QueryClient in React Query)
 *
 * @internal
 */
interface ClientCache {
  client: SmartWalletClient | null;
  account: SmartContractAccount | null;
  cacheKey: string | null;
}

const ClientCacheContext = createContext<ClientCache | null>(null);

/**
 * Provider component that configures Alchemy infrastructure for transaction handling
 * Must be nested INSIDE PrivyProvider to access authentication state
 * Automatically manages client cache lifecycle and resets on logout
 *
 * @param {PropsWithChildren<AlchemyProviderConfig>} props - Component props
 * @param {React.ReactNode} props.children - React children to wrap with Alchemy configuration
 * @param {string} [props.apiKey] - Your Alchemy API key
 * @param {string} [props.jwt] - JWT token for authentication
 * @param {string} [props.rpcUrl] - Custom RPC URL for EVM chains
 * @param {string} [props.solanaRpcUrl] - Custom RPC URL for Solana
 * @param {string | string[]} [props.policyId] - Gas Manager policy ID(s) for EVM chains
 * @param {string | string[]} [props.solanaPolicyId] - Gas Manager policy ID(s) for Solana
 * @param {boolean} [props.disableSponsorship] - Set to true to disable sponsorship by default (default: false)
 * @param {'eip7702' | 'owner'} [props.accountAuthMode] - Authorization mode for EVM smart accounts (default: 'eip7702')
 * @returns {JSX.Element} Provider component
 *
 * @example
 * ```tsx
 * <PrivyProvider appId="...">
 *   <AlchemyProvider
 *     apiKey="your-alchemy-api-key"
 *     policyId="your-gas-policy-id"
 *   >
 *     <YourApp />
 *   </AlchemyProvider>
 * </PrivyProvider>
 * ```
 */
export function AlchemyProvider({
  children,
  accountAuthMode = "eip7702",
  ...config
}: PropsWithChildren<AlchemyProviderConfig>) {
  const { authenticated, user } = usePrivy();

  // Normalize config with default values
  const normalizedConfig: NormalizedAlchemyConfig = {
    ...config,
    accountAuthMode,
  };

  // Store cache in a ref - persists across renders but scoped to this component instance
  // This makes it SSR-safe (each request gets its own cache) and React StrictMode-safe
  const cache = useRef<ClientCache>({
    client: null,
    account: null,
    cacheKey: null,
  });

  // Track previous state to detect logout and wallet changes
  const prevAuthenticatedRef = useRef(authenticated);
  const prevWalletAddressRef = useRef(user?.wallet?.address);

  // Automatically reset cache when user logs out or switches wallets
  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current;
    const prevWalletAddress = prevWalletAddressRef.current;
    const currentWalletAddress = user?.wallet?.address;

    // Reset cache on logout
    if (wasAuthenticated && !authenticated) {
      cache.current.client = null;
      cache.current.account = null;
      cache.current.cacheKey = null;
    }

    // Reset cache on wallet address change (account switching)
    if (
      authenticated &&
      prevWalletAddress &&
      currentWalletAddress &&
      prevWalletAddress !== currentWalletAddress
    ) {
      cache.current.client = null;
      cache.current.account = null;
      cache.current.cacheKey = null;
    }

    // Update refs for next render
    prevAuthenticatedRef.current = authenticated;
    prevWalletAddressRef.current = currentWalletAddress;
  }, [authenticated, user?.wallet?.address]);

  return (
    <AlchemyContext.Provider value={normalizedConfig}>
      <ClientCacheContext.Provider value={cache.current}>
        {children}
      </ClientCacheContext.Provider>
    </AlchemyContext.Provider>
  );
}

/**
 * Hook to access Alchemy provider configuration
 * Must be used within an <AlchemyProvider> component
 *
 * @returns {NormalizedAlchemyConfig} The current Alchemy configuration with defaults applied
 * @throws {Error} If used outside of AlchemyProvider
 *
 * @example
 * ```tsx
 * const config = useAlchemyConfig();
 * console.log('Policy ID:', config.policyId);
 * console.log('Auth Mode:', config.accountAuthMode); // Always defined
 * ```
 */
export function useAlchemyConfig(): NormalizedAlchemyConfig {
  const context = useContext(AlchemyContext);
  if (!context) {
    throw new Error("useAlchemyConfig must be used within <AlchemyProvider />");
  }
  return context;
}

/**
 * Hook to access the client cache (internal use only)
 *
 * @internal
 * @returns {ClientCache} The client cache object
 */
export function useClientCache(): ClientCache {
  const context = useContext(ClientCacheContext);
  if (!context) {
    throw new Error(
      "useClientCache must be used within <AlchemyProvider />. Make sure AlchemyProvider is nested inside PrivyProvider.",
    );
  }
  return context;
}
