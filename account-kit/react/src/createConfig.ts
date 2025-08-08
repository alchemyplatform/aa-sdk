import {
  type AlchemyAccountsConfig,
  type CreateConfigProps,
} from "@account-kit/core";
import { createConfig as createCoreConfig } from "@account-kit/core";
import { walletConnect } from "wagmi/connectors";
import type { AuthType } from "./components/auth/types.js";
import { ReactLogger } from "./metrics.js";
import type { AlchemyAccountsUIConfig } from "./types";
import { getWalletConnectParams } from "./utils.js";
import { WALLET_CONNECT } from "./components/auth/card/eoa.js";

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
 *   sessionConfig: {
 *     expirationTimeMs: 1000 * 60 * 60, // 1 hour (defaults to 15 min)
 *   },
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
  ui?: AlchemyAccountsUIConfig,
): AlchemyAccountsConfigWithUI => {
  if (
    ui?.auth?.sections.some((x) =>
      x.some((y) => y.type === "social" && y.mode === "popup"),
    )
  ) {
    props.enablePopupOauth = true;
  }

  const externalWalletSection = ui?.auth?.sections
    .find((x) => x.some((y) => y.type === "external_wallets"))
    ?.find((x) => x.type === "external_wallets") as
    | Extract<AuthType, { type: "external_wallets" }>
    | undefined;

  // New simplified external wallets support
  if (externalWalletSection && externalWalletSection.walletNames) {
    // Build from names + chainType; rely on configForExternalWallets in app to supply connectors/adapters
    // Optionally ensure WalletConnect connector is present for UI only flows
    if (
      externalWalletSection.walletConnectProjectId &&
      !props.connectors?.some((x) => "type" in x && x.type === WALLET_CONNECT)
    ) {
      const walletConnectParams = getWalletConnectParams({
        projectId: externalWalletSection.walletConnectProjectId,
      })!;
      props.connectors ??= [];
      props.connectors.push(walletConnect(walletConnectParams));
    }
  }

  const config = createCoreConfig(props);

  ReactLogger.trackEvent({
    name: "config_created",
    data:
      ui == null
        ? { noUi: true }
        : // we can't log react components so we need to strip out the header if it exists
          {
            ...ui,
            auth: ui.auth
              ? {
                  ...ui.auth,
                  header: ui.auth.header ? "custom" : "default",
                }
              : undefined,
          },
  });

  return {
    ...config,
    ui,
  };
};
