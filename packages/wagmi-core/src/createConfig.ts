import {
  createConfig as wagmiCreateConfig,
  type CreateConfigParameters,
  type Config,
} from "wagmi";

export interface AlchemyConfig extends Config {
  /** All Alchemy‑specific state lives under this namespace. */
}

export type AlchemyCreateConfigParameters = CreateConfigParameters & {
  // Additional Alchemy-specific parameters can be added here
  // For example: alchemyOptions?: AlchemyOptions;
};

export function createConfig(
  config: AlchemyCreateConfigParameters,
): AlchemyConfig {
  return wagmiCreateConfig(config);
}
