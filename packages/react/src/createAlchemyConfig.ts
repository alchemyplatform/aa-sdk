import { alchemyTransport } from "@alchemy/common";
import { alchemyAuth } from "@alchemy/connectors-web";
import { createConfig, type CreateConfigParameters, type Config } from "wagmi";
import type { Chain } from "viem";

/**
 * Configuration options for creating an Alchemy config
 */
export type CreateAlchemyConfigOptions = {
  /**
   * Alchemy API key for authentication and transport
   */
  apiKey?: string;

  /**
   * Alchemy JWT for authentication and transport
   */
  jwt?: string;

  /**
   * Custom RPC URL for transport
   */
  url?: string;

  /**
   * List of EVM chains to support
   */
  chains: readonly [Chain, ...Chain[]];

  /**
   * Policy IDs for gas sponsorship (optional)
   */
  policyIds?: string[];

  /**
   * Enable server-side rendering support (optional)
   */
  ssr?: boolean;

  /**
   * Advanced: Override any wagmi config parameters
   * These will be shallow-merged with the auto-generated config
   */
  wagmiOverrides?: Partial<CreateConfigParameters>;
};

/**
 * Return type for createAlchemyConfig
 */
export type AlchemyReactConfig = {
  /** Wagmi config for use with WagmiProvider */
  wagmi: Config;

  // Future extensions (not implemented in M2):
  // solana?: AlchemySolanaConfig;
  // ui?: AlchemyUIConfig;
};

/**
 * Creates a simplified Alchemy configuration for React applications
 *
 * This function removes the boilerplate of setting up wagmi with Alchemy by:
 * - Automatically configuring Alchemy transport for each chain
 * - Automatically adding Alchemy auth connector
 * - Providing sensible defaults
 * - Offering escape hatches for advanced customization
 *
 * @example
 * ```tsx
 * import { createAlchemyConfig } from "@alchemy/react";
 * import { arbitrumSepolia, sepolia } from "wagmi/chains";
 *
 * const config = createAlchemyConfig({
 *   apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
 *   chains: [arbitrumSepolia, sepolia],
 * });
 *
 * // Use with AlchemyProvider or WagmiProvider
 * <AlchemyProvider config={config}>
 *   {children}
 * </AlchemyProvider>
 * ```
 *
 * @param {CreateAlchemyConfigOptions} options - Configuration options for the Alchemy config
 * @returns {AlchemyReactConfig} AlchemyReactConfig object containing the wagmi config
 */
export function createAlchemyConfig(
  options: CreateAlchemyConfigOptions,
): AlchemyReactConfig {
  const {
    apiKey,
    jwt,
    url,
    chains,
    // policyIds, // TODO: Will be used when alchemySmartWallet is completed and the default connector
    ssr = false,
    wagmiOverrides,
  } = options;

  // Validate that at least one auth method is provided
  if (!apiKey && !jwt && !url) {
    throw new Error(
      "createAlchemyConfig requires at least one of: apiKey, jwt, or url",
    );
  }

  // Create transports for each chain using Alchemy transport
  const transports: CreateConfigParameters["transports"] = {};

  for (const chain of chains) {
    transports[chain.id] = alchemyTransport({
      ...(apiKey && { apiKey }),
      ...(jwt && { jwt }),
      ...(url && { url }),
    });
  }

  // Create default connectors
  // Note: Currently using alchemyAuth, will switch to alchemySmartWallet when it's ready
  // The walletType parameter will be used in the future to configure the connector
  const defaultConnectors = [
    alchemyAuth({
      apiKey,
    }),
  ];

  // Build the wagmi config with automatic Alchemy setup
  const wagmiConfig = createConfig({
    chains: wagmiOverrides?.chains ?? chains,
    transports: wagmiOverrides?.transports ?? transports,
    connectors: wagmiOverrides?.connectors ?? defaultConnectors,
    ssr,
    ...(wagmiOverrides?.multiInjectedProviderDiscovery !== undefined && {
      multiInjectedProviderDiscovery:
        wagmiOverrides.multiInjectedProviderDiscovery,
    }),
    ...(wagmiOverrides?.storage && { storage: wagmiOverrides.storage }),
    ...(wagmiOverrides?.syncConnectedChain !== undefined && {
      syncConnectedChain: wagmiOverrides.syncConnectedChain,
    }),
  });

  // Return structured config for future extensibility
  return {
    wagmi: wagmiConfig,
    // Future: solana config
    // Future: ui config
  };
}
