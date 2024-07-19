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
 * @example
 * ```ts
 * import { sepolia } from "@account-kit/infra"
 * import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react"
 * import { QueryClient } from "@tanstack/react-query";
 *
 * const uiConfig: AlchemyAccountsUIConfig = {
 *   illustrationStyle: "linear",
 *   auth: {
 *     sections: [[{ type: "email" }], [{ type: "passkey" }]],
 *     addPasskeyOnSignup: true,
 *     showSignInText: true,
 *   },
 * }
 *
 * const config = createConfig({
 *   rpcUrl: "/api/rpc",
 *   chain: sepolia,
 *   ssr: true,
 * }, uiConfig)
 *
 * export const queryClient = new QueryClient();
 * ```
 *
 * @param {CreateConfigProps} props for creating an alchemy account config
 * @param {AlchemyAccountsUIConfig} ui (optional) configuration to use for the Auth Components UI
 * @returns {AlchemyAccountsConfigWithUI} an alchemy account config object containing the core and client store, as well as the UI config
 */
export const createConfig = (
  props: CreateConfigProps,
  ui?: AlchemyAccountsUIConfig
): AlchemyAccountsConfigWithUI => {
  const config = createCoreConfig(props);

  return {
    ...config,
    ui,
  };
};
