"use client";

import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import type { AlchemyReactConfig } from "./createAlchemyConfig.js";

/**
 * Props for the AlchemyProvider component
 */
export type AlchemyProviderProps = {
  /** The Alchemy configuration object created by createAlchemyConfig */
  config: AlchemyReactConfig;
  /** Child components to render */
  children: ReactNode;
};

/**
 * AlchemyProvider component that wraps the necessary providers for Alchemy functionality
 *
 * This component:
 * - Wraps WagmiProvider with the wagmi config from createAlchemyConfig
 * - Provides QueryClient for data fetching (required by wagmi)
 * - Will wrap additional providers in the future (Solana, UI, etc.)
 *
 * @param {AlchemyProviderProps} props - The props for the AlchemyProvider component
 * @param {AlchemyReactConfig} props.config - The Alchemy configuration object created by createAlchemyConfig
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The wrapped React components with Alchemy providers
 *
 * @example
 * ```tsx
 * import { AlchemyProvider, createAlchemyConfig } from "@alchemy/react";
 * import { arbitrumSepolia, sepolia } from "wagmi/chains";
 *
 * const config = createAlchemyConfig({
 *   apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
 *   chains: [arbitrumSepolia, sepolia],
 * });
 *
 * export function App({ children }) {
 *   return (
 *     <AlchemyProvider config={config}>
 *       {children}
 *     </AlchemyProvider>
 *   );
 * }
 * ```
 */
export function AlchemyProvider({ config, children }: AlchemyProviderProps) {
  return (
    <WagmiProvider config={config.wagmi}>
      {children as any}
      {/* Future: Additional providers will be added here */}
      {/* e.g., <AlchemySolanaProvider config={config.solana}> */}
      {/* e.g., <AlchemyUIProvider config={config.ui}> */}
    </WagmiProvider>
  );
}
