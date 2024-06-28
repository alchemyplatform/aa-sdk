import {
  createConfig as createCoreConfig,
  type AlchemyAccountsConfig,
  type CreateConfigProps,
} from "@account-kit/core";
import type { AlchemyAccountsUIConfig } from "./types";

export type CreateConfigWithUIProps = CreateConfigProps & {
  ui?: AlchemyAccountsUIConfig;
};

export type AlchemyAccountsConfigWithUI = AlchemyAccountsConfig & {
  ui?: AlchemyAccountsUIConfig;
};

/**
 * Wraps the `createConfig` that is exported from `@aa-sdk/core` to allow passing
 * an additional parameter, `ui`, which is the configuration object for the Auth Component UI
 * (the modal and AuthCard).
 *
 * @param params {@link CreateConfigWithUIProps} to use for creating an alchemy account config as well as the UI config
 * @returns an alchemy account config object containing the core and client store, as well as the UI config
 */
export const createConfig = (
  params: CreateConfigWithUIProps
): AlchemyAccountsConfigWithUI => {
  const { ui, ...config } = params;
  const coreConfig = createCoreConfig(config);

  return {
    ...coreConfig,
    ui,
  };
};
