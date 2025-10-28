import type { PropsWithChildren } from "react";
import { AlchemyContextProvider } from "../context/AlchemyContext.js";
import { reactNativeAdapter } from "../adapters/react-native.js";
import type { AlchemyProviderConfig } from "../types.js";

/**
 * Provider component for React Native (Expo) applications
 * Must be nested INSIDE PrivyProvider from @privy-io/expo
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
 * import { PrivyProvider } from '@privy-io/expo';
 * import { AlchemyProvider } from '@account-kit/privy-integration/react-native';
 *
 * <PrivyProvider appId="..." clientId="...">
 *   <AlchemyProvider
 *     apiKey="your-alchemy-api-key"
 *     policyId="your-gas-policy-id"
 *     accountAuthMode="eip7702"
 *   >
 *     <YourApp />
 *   </AlchemyProvider>
 * </PrivyProvider>
 * ```
 */
export function AlchemyProvider({
  children,
  ...config
}: PropsWithChildren<AlchemyProviderConfig>) {
  return (
    <AlchemyContextProvider config={config} adapter={reactNativeAdapter}>
      {children}
    </AlchemyContextProvider>
  );
}
