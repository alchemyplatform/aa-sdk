import {
  createConfig as createCoreConfig,
  type AlchemyAccountsConfig,
  type CreateConfigProps,
} from "@account-kit/core";
import type { AlchemyAccountsUIConfig } from "./types";

export type AlchemyAccountsConfigWithUI = AlchemyAccountsConfig & {
  ui?: AlchemyAccountsUIConfig;
};

/**
 * Wraps the `createConfig` that is exported from `@aa-sdk/core` to allow passing
 * an additional argument, the configuration object for the Auth Components UI
 * (the modal and AuthCard).
 *
 * @param {CreateConfigProps} props for creating an alchemy account config
 * @param {AlchemyAccountsUIConfig} ui the configuration to use for the Auth Components UI
 * @returns an alchemy account config object containing the core and client store, as well as the UI config
 */
export const createConfig = (
  props: CreateConfigProps,
  ui: AlchemyAccountsUIConfig
): AlchemyAccountsConfigWithUI => {
  const config = createCoreConfig(props);

  return {
    ...config,
    ui,
  };
};
