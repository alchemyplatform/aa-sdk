import {
  type PropsWithChildren,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import type { AlchemyProviderConfig } from "../types.js";
import type { PrivyAdapter } from "../adapters/types.js";

/**
 * Context for Alchemy configuration
 */
const AlchemyConfigContext = createContext<AlchemyProviderConfig | null>(null);

/**
 * Context for the platform adapter
 */
const AdapterContext = createContext<PrivyAdapter | null>(null);

/**
 * Client cache stored in React tree (similar to QueryClient in React Query)
 *
 * @internal
 */
interface ClientCache {
  client: SmartWalletClient | null;
  cacheKey: string | null;
}

const ClientCacheContext = createContext<ClientCache | null>(null);

/**
 * Props for AlchemyContextProvider
 */
interface AlchemyContextProviderProps extends PropsWithChildren {
  config: AlchemyProviderConfig;
  adapter: PrivyAdapter;
}

/**
 * Internal provider component that manages Alchemy context
 * Used by both web and React Native providers
 *
 * @internal
 * @param {AlchemyContextProviderProps} props - Component props
 * @param {React.ReactNode} props.children - React children to wrap with context
 * @param {AlchemyProviderConfig} props.config - Alchemy configuration
 * @param {PrivyAdapter} props.adapter - Platform adapter
 * @returns {JSX.Element} Context provider component
 */
export function AlchemyContextProvider({
  children,
  config,
  adapter,
}: AlchemyContextProviderProps) {
  const { authenticated, user } = adapter.usePrivyAuth();

  // Store cache in a ref - persists across renders but scoped to this component instance
  // This makes it SSR-safe (each request gets its own cache) and React StrictMode-safe
  const cache = useRef<ClientCache>({
    client: null,
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
      cache.current.cacheKey = null;
    }

    // Update refs for next render
    prevAuthenticatedRef.current = authenticated;
    prevWalletAddressRef.current = currentWalletAddress;
  }, [authenticated, user?.wallet?.address]);

  return (
    <AlchemyConfigContext.Provider value={config}>
      <AdapterContext.Provider value={adapter}>
        <ClientCacheContext.Provider value={cache.current}>
          {children}
        </ClientCacheContext.Provider>
      </AdapterContext.Provider>
    </AlchemyConfigContext.Provider>
  );
}

/**
 * Hook to access Alchemy provider configuration
 * Must be used within an <AlchemyProvider> component
 *
 * @returns {AlchemyProviderConfig} The current Alchemy configuration
 * @throws {Error} If used outside of AlchemyProvider
 *
 * @example
 * ```tsx
 * const config = useAlchemyConfig();
 * console.log('Policy ID:', config.policyId);
 * ```
 */
export function useAlchemyConfig(): AlchemyProviderConfig {
  const context = useContext(AlchemyConfigContext);
  if (!context) {
    throw new Error("useAlchemyConfig must be used within <AlchemyProvider />");
  }
  return context;
}

/**
 * Hook to access the platform adapter
 * Must be used within an <AlchemyProvider> component
 *
 * @internal
 * @returns {PrivyAdapter} The platform adapter
 */
export function useAdapter(): PrivyAdapter {
  const context = useContext(AdapterContext);
  if (!context) {
    throw new Error(
      "useAdapter must be used within <AlchemyProvider />. Make sure AlchemyProvider is nested inside PrivyProvider.",
    );
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
