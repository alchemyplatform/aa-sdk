import {
  createConfig as wagmiCreateConfig,
  type CreateConfigParameters,
  type Config,
} from "wagmi";

/**
 * The Alchemy-flavored Wagmi `Config`.
 *
 * This extends Wagmi's `Config` type to allow Alchemy-specific namespace(s) and
 * future extensions while remaining fully compatible with Wagmi consumers.
 */
export type AlchemyConfig = Config & {
  /** All Alchemy‑specific state lives under this namespace. */
};

/**
 * Parameters for creating an AlchemyConfig.
 *
 * This mirrors Wagmi's CreateConfigParameters and exists as a stable
 * extension point for Alchemy-specific options in the future (e.g.
 * `alchemyOptions`). It is currently a thin passthrough to Wagmi.
 */
export type AlchemyCreateConfigParameters = CreateConfigParameters & {
  // Additional Alchemy-specific parameters can be added here
  // For example: alchemyOptions?: AlchemyOptions;
};

/**
 * Create an Alchemy-flavored Wagmi configuration.
 *
 * This is a thin wrapper around Wagmi's createConfig that returns
 * an AlchemyConfig. It is intended to be used anywhere you would use
 * Wagmi's `createConfig`, but provides a type-level hook for Alchemy-specific
 * options and behaviors.
 *
 * @param {AlchemyCreateConfigParameters} config - Wagmi configuration parameters (with room for
 *   Alchemy-specific extensions in the future).
 * @returns {AlchemyConfig} An Alchemy-flavored Wagmi `Config` that can be passed to Wagmi APIs.
 *
 * @example
 * ```ts
 * import { http } from 'viem'
 * import { mainnet } from 'wagmi/chains'
 * import { alchemyAuth } from '@alchemy/connectors-web'
 * import { createConfig } from '@alchemy/wagmi-core'
 *
 * const config = createConfig({
 *   chains: [mainnet],
 *   transports: {
 *     [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/<api-key>')
 *   },
 *   connectors: [alchemyAuth()],
 * })
 * ```
 */
export function createConfig(
  config: AlchemyCreateConfigParameters,
): AlchemyConfig {
  return wagmiCreateConfig(config);
}
