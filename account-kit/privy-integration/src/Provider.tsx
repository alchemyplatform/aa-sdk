import { type PropsWithChildren, createContext, useContext } from "react";
import type { AlchemyProviderConfig } from "./types.js";

const AlchemyContext = createContext<AlchemyProviderConfig | null>(null);

/**
 * Provider component that configures Alchemy infrastructure for transaction handling
 * Must wrap your app to enable gas sponsorship, swaps, and EIP-7702 delegation
 *
 * @param {PropsWithChildren<AlchemyProviderConfig>} props - Component props
 * @param {React.ReactNode} props.children - React children to wrap with Alchemy configuration
 * @param {string} [props.apiKey] - Your Alchemy API key
 * @param {string} [props.jwt] - JWT token for authentication
 * @param {string} [props.url] - Custom RPC URL
 * @param {string | string[]} [props.policyId] - Gas Manager policy ID(s). If array is provided, the first policy will be used for all transactions.
 * @param {boolean} [props.defaultSponsored] - Enable sponsorship by default (default: true)
 * @returns {JSX.Element} Provider component
 *
 * @example
 *
 * ```tsx
 * <AlchemyProvider
 *   apiKey="your-alchemy-api-key"
 *   policyId="your-gas-policy-id"
 * >
 *   <YourApp />
 * </AlchemyProvider>
 * ```
 */
export function AlchemyProvider({
  children,
  ...config
}: PropsWithChildren<AlchemyProviderConfig>) {
  return (
    <AlchemyContext.Provider value={config}>{children}</AlchemyContext.Provider>
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
  const context = useContext(AlchemyContext);
  if (!context) {
    throw new Error("useAlchemyConfig must be used within <AlchemyProvider />");
  }
  return context;
}
