import {
  type AlchemyAccountsConfig,
  type CreateConfigProps,
  getSolanaConnection,
} from "@account-kit/core";
import { createConfig as createCoreConfig } from "@account-kit/core";
import { walletConnect } from "wagmi/connectors";
import type { AuthType } from "./components/auth/types.js";
import { ReactLogger } from "./metrics.js";
import type { AlchemyAccountsUIConfig } from "./types";
import { getWalletConnectParams } from "./utils.js";
import { WALLET_CONNECT } from "./components/auth/card/eoa.js";
// import type { WalletAdapter } from "@solana/wallet-adapter-base";
// import type { Connector } from "wagmi";

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
 * import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
 * import { QueryClient } from "@tanstack/react-query";
 *
 * const uiConfig: AlchemyAccountsUIConfig = {
 *   illustrationStyle: "linear",
 *   auth: {
 *     sections: [
 *       [{ type: "email" }],
 *       [{ type: "passkey" }],
 *       [{
 *         type: "external_wallets",
 *         walletConnect: { projectId: "your_project_id" },
 *         inline: {
 *           wallets: ["MetaMask", "Phantom", "WalletConnect"],
 *           maxCount: 3,
 *           showMoreButton: true,
 *           moreButtonText: "More wallets"
 *         }
 *       }]
 *     ],
 *     addPasskeyOnSignup: true,
 *   },
 * }
 *
 * const config = createConfig({
 *   transport: alchemy({ apiKey: "your_api_key" }),
 *   chain: sepolia,
 *   ssr: true,
 *   solana: {
 *     connection: solanaConnection,
 *     adapters: [
 *       new PhantomWalletAdapter(),
 *       new SolflareWalletAdapter(),
 *     ]
 *   }
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

  if (
    externalWalletSection?.walletConnect &&
    !props.connectors?.some((x) => "type" in x && x.type === WALLET_CONNECT)
  ) {
    const walletConnectAuthConfig = externalWalletSection?.walletConnect;
    const walletConnectParams = getWalletConnectParams(
      walletConnectAuthConfig,
    )!;

    props.connectors ??= [];
    props.connectors.push(walletConnect(walletConnectParams));
  }

  const config = createCoreConfig(props);

  // Validate Solana wallet configuration in development
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    validateSolanaWalletConfig(config, externalWalletSection);
  }

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

/**
 * Validates Solana wallet configuration and provides helpful warnings
 *
 * @param {AlchemyAccountsConfig} config The account config to validate
 * @param {Extract<AuthType, { type: "external_wallets" }> | undefined} externalWalletSection The external wallet section from UI config
 */
function validateSolanaWalletConfig(
  config: AlchemyAccountsConfig,
  externalWalletSection?: Extract<AuthType, { type: "external_wallets" }>,
) {
  const solanaConnection = getSolanaConnection(config);
  const featuredWallets = externalWalletSection?.featuredWallets?.wallets;

  if (!featuredWallets || featuredWallets.length === 0) {
    return; // No featured wallets specified, nothing to validate
  }

  // Extract Solana wallet configs for validation
  const solanaWalletConfigs = featuredWallets.filter(
    (wallet) => wallet.adapter,
  );

  if (!solanaConnection?.adapters || solanaConnection.adapters.length === 0) {
    if (solanaWalletConfigs.length > 0) {
      const adapterNames = solanaWalletConfigs.map(
        (w) => w.adapter?.name || "Unknown",
      );
      console.warn(
        `[Account Kit] You specified Solana wallets in UI config (${adapterNames.join(", ")}) but no Solana adapters in core config. ` +
          `Add adapters to your solana.adapters array:\n\n` +
          `import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";\n\n` +
          `createConfig({\n` +
          `  // ... other config\n` +
          `  solana: {\n` +
          `    connection: solanaConnection,\n` +
          `    adapters: [\n` +
          `      new PhantomWalletAdapter(),\n` +
          `      new SolflareWalletAdapter(),\n` +
          `    ]\n` +
          `  }\n` +
          `})`,
      );
    }
    return;
  }

  // Check for mismatches between UI config and available adapters
  const availableAdapterNames = solanaConnection.adapters.map((adapter) =>
    adapter.name.toString(),
  );
  const missingAdapters = solanaWalletConfigs.filter((walletConfig) => {
    const adapterInstance = new walletConfig.adapter();
    return !availableAdapterNames.includes(adapterInstance.name);
  });

  if (missingAdapters.length > 0) {
    const missingNames = missingAdapters.map((w) => new w.adapter().name);
    console.warn(
      `[Account Kit] Some wallets specified in UI config are not available: ${missingNames.join(", ")}.\n` +
        `Available Solana adapters: ${availableAdapterNames.join(", ")}.\n` +
        `These wallets won't be shown in the featured wallet selection.`,
    );
  }
}
