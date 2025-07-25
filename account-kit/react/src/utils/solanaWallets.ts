import type { WalletAdapter } from "@solana/wallet-adapter-base";
import type { Connector } from "wagmi";
import type { WalletReference } from "../components/auth/wallet-buttons/types.js";

/**
 * Helper function to get wallet names from adapters for UI configuration
 *
 * @param {WalletAdapter[]} adapters Array of Solana wallet adapters
 * @returns {string[]} Array of wallet names that can be used in UI config
 *
 * @example
 * ```ts
 * import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
 * import { getWalletNamesFromAdapters } from "@account-kit/react";
 *
 * const adapters = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
 * const walletNames = getWalletNamesFromAdapters(adapters); // ["Phantom", "Solflare"]
 * ```
 */
export function getWalletNamesFromAdapters(
  adapters: WalletAdapter[],
): string[] {
  return adapters.map((adapter) => adapter.name.toString());
}

/**
 * Helper function to create an inline wallet configuration from adapters and connectors
 *
 * @param {object} options Configuration options
 * @param {WalletAdapter[]} options.solanaAdapters Solana wallet adapters to include
 * @param {Connector[]} options.connectors EVM connectors to include
 * @param {boolean} options.includeWalletConnect Whether to include WalletConnect
 * @param {number} options.maxCount Maximum number of wallets to show inline
 * @param {string} options.moreButtonText Custom text for "more wallets" button
 * @returns {object} Inline wallet configuration object
 *
 * @example
 * ```ts
 * import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
 * import { injected } from "wagmi/connectors";
 * import { createInlineWalletConfig } from "@account-kit/react";
 *
 * const phantomAdapter = new PhantomWalletAdapter();
 * const metamaskConnector = injected();
 *
 * const inlineConfig = createInlineWalletConfig({
 *   solanaAdapters: [phantomAdapter],
 *   connectors: [metamaskConnector],
 *   includeWalletConnect: true,
 *   maxCount: 3
 * });
 *
 * // Use in UI config:
 * const uiConfig = {
 *   auth: {
 *     sections: [[{
 *       type: "external_wallets",
 *       inline: inlineConfig
 *     }]]
 *   }
 * };
 * ```
 */
export function createInlineWalletConfig(
  options: {
    solanaAdapters?: WalletAdapter[];
    connectors?: Connector[];
    includeWalletConnect?: boolean;
    maxCount?: number;
    moreButtonText?: string;
  } = {},
): {
  wallets: WalletReference[];
  maxCount: number;
  showMoreButton: boolean;
  moreButtonText: string;
} {
  const {
    solanaAdapters = [],
    connectors = [],
    includeWalletConnect = true,
    maxCount = 3,
    moreButtonText = "More wallets",
  } = options;

  const wallets: WalletReference[] = [];

  // Add Solana adapters directly
  wallets.push(...solanaAdapters);

  // Add EVM connectors directly
  wallets.push(...connectors);

  // Add WalletConnect as string if requested
  if (includeWalletConnect) {
    wallets.push("WalletConnect");
  }

  return {
    wallets,
    maxCount,
    showMoreButton: true,
    moreButtonText,
  };
}

/**
 * Helper to create ordered wallet lists with explicit control over ordering
 *
 * @param {WalletReference[]} priorityWallets Wallets in desired order (adapters, connectors, or string IDs)
 * @param {object} options Additional options
 * @param {number} options.maxCount Maximum number of wallets to show inline
 * @param {string} options.moreButtonText Custom text for "more wallets" button
 * @returns {object} Inline wallet configuration
 *
 * @example
 * ```ts
 * const phantomAdapter = new PhantomWalletAdapter();
 * const metamaskConnector = injected();
 *
 * const config = createOrderedWalletConfig([
 *   phantomAdapter,      // Show Phantom first
 *   "WalletConnect",     // Then WalletConnect
 *   metamaskConnector,   // Then MetaMask
 * ], { maxCount: 2 });
 * ```
 */
export function createOrderedWalletConfig(
  priorityWallets: WalletReference[],
  options: {
    maxCount?: number;
    moreButtonText?: string;
  } = {},
): {
  wallets: WalletReference[];
  maxCount: number;
  showMoreButton: boolean;
  moreButtonText: string;
} {
  const { maxCount = 3, moreButtonText = "More wallets" } = options;

  return {
    wallets: priorityWallets,
    maxCount,
    showMoreButton: true,
    moreButtonText,
  };
}
