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
  chains: [Chain, ...Chain[]];

  /**
   * Policy IDs for gas sponsorship (optional)
   */
  policyIds?: string[];

  /**
   * Enable server-side rendering support (optional)
   */
  ssr?: boolean;
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
    // policyIds, // TODO: add when smart wallet becomes default
    ssr = false,
  } = options;

  if (!chains?.length) {
    throw new Error("createAlchemyConfig requires at least one EVM chain.");
  }

  // If the caller didn't provide custom transports, we will build them.
  if (!apiKey && !jwt && !url) {
    throw new Error("createAlchemyConfig requires apiKey, jwt, or url.");
  }

  // Build transports from chains when needed.
  const transports: CreateConfigParameters["transports"] = (() => {
    const baseInit = {
      ...(apiKey && { apiKey }),
      ...(jwt && { jwt }),
      ...(url && { url }),
    };
    const perChain: NonNullable<CreateConfigParameters["transports"]> = {};
    for (const chain of chains) {
      perChain[chain.id] = alchemyTransport(baseInit);
    }
    return perChain;
  })();

  // Note: Currently using alchemyAuth; swap to alchemySmartWallet when ready.
  const defaultConnectors = [
    // Currently alchemyAuth only supports apiKey
    ...(apiKey ? [alchemyAuth({ apiKey })] : []),
  ];

  const wagmiConfig = createConfig({
    chains,
    transports: transports!,
    connectors: defaultConnectors,
    ssr,
  });

  // Return structured config for future extensibility
  return {
    wagmi: wagmiConfig,
    // Future: solana config
    // Future: ui config
  };
}
