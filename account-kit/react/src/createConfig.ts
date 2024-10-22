import {
  createConfig as createCoreConfig,
  type AlchemyAccountsConfig,
  type CreateConfigProps,
} from "@account-kit/core";
import { ReactLogger } from "./metrics.js";
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
 * import { sepolia, alchemy } from "@account-kit/infra"
 * import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react"
 * import { QueryClient } from "@tanstack/react-query";
 *
 * const uiConfig: AlchemyAccountsUIConfig = {
 *   illustrationStyle: "linear",
 *   auth: {
 *     sections: [[{ type: "email" }], [{ type: "passkey" }]],
 *     addPasskeyOnSignup: true,
 *   },
 * }
 *
 * const config = createConfig({
 *   transport: alchemy({ apiKey: "your_api_key" })
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
  if (
    ui?.auth?.sections.some((x) =>
      x.some((y) => y.type === "social" && y.mode === "popup")
    )
  ) {
    props.enablePopupOauth = true;
  }

  const config = createCoreConfig(props);

  ReactLogger.trackEvent({
    name: "config_created",
    data: ui == null ? { noUi: true } : ui,
  });

  return {
    ...config,
    ui,
  };
};
