import { walletConnect, metaMask, coinbaseWallet } from "wagmi/connectors";
import type { CreateConnectorFn } from "wagmi";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

// Wallet configuration types
export interface ExternalWalletUIConfig {
  featured?: number; // Index for featured ordering (0, 1, 2, etc.)
  logoUrl?: string; // Custom logo URL
  id: string; // Unique identifier for the wallet
  type: "evm" | "solana" | "walletconnect"; // Type of wallet
}

export interface ExternalWalletConfig {
  featured?: number; // Index for featured ordering (0, 1, 2, etc.)
  adapter?: typeof PhantomWalletAdapter | typeof SolflareWalletAdapter; // Solana adapter class
  connector?: typeof metaMask | typeof coinbaseWallet; // EVM connector function
  type?: "WalletConnect"; // Built-in wallet types
  logoUrl?: string; // Custom logo URL
  projectId?: string; // For WalletConnect
}

interface ConfigForExternalWalletsParams {
  wallets: ExternalWalletConfig[];
  projectId?: string; // Fallback project ID for WalletConnect wallets that don't specify their own
  moreButtonText?: string;
}

interface ConfigForExternalWalletsResult {
  connectors: CreateConnectorFn[];
  adapters: WalletAdapter[];
  uiConfig: {
    walletConnect?: { projectId: string };
    wallets?: ExternalWalletUIConfig[];
    moreButtonText?: string;
  };
}

// Internal helper type used after normalising an `ExternalWalletConfig`.
// Kept intentionally close to existing behaviour (we still pass connector *functions*,
// not the instantiated connectors, so that downstream code & dedup logic remain
// unchanged).
type ProcessedWallet =
  | { type: "adapter"; value: WalletAdapter }
  | { type: "connector"; value: typeof metaMask | typeof coinbaseWallet }
  | { type: "string"; value: "WalletConnect"; projectId: string };

/**
 * Configure external wallets for Account Kit, inspired by RainbowKit's connectorsForWallets
 * Handles both EVM connectors and Solana adapters, returns config for core and UI
 *
 * @param {ConfigForExternalWalletsParams} root0 - Configuration parameters object
 * @param {WalletConfig[]} root0.wallets - Array of wallet configurations
 * @param {string} [root0.projectId] - Fallback project ID for WalletConnect wallets that don't specify their own
 * @param {string} [root0.moreButtonText] - Text for the "more wallets" button
 * @returns {ConfigForExternalWalletsResult} Object containing connectors, adapters, and UI config
 */
export const configForExternalWallets = ({
  wallets,
  projectId,
  moreButtonText = "More wallets",
}: ConfigForExternalWalletsParams): ConfigForExternalWalletsResult => {
  if (!wallets.length) {
    throw new Error("No wallets provided");
  }

  const connectors: CreateConnectorFn[] = [];
  const adapters: WalletAdapter[] = [];
  const uiWallets: ExternalWalletUIConfig[] = [];

  // Track seen wallet names for deduplication
  const seenConnectors = new Set<string>();
  const seenAdapters = new Set<string>();

  // Build a single ordered list: featured (sorted) first, then the rest.
  const featuredConfigs: (ExternalWalletConfig & { featured: number })[] =
    wallets.filter(
      (w): w is ExternalWalletConfig & { featured: number } =>
        typeof w.featured === "number",
    );

  featuredConfigs.sort((a, b) => a.featured - b.featured);

  const nonFeaturedConfigs = wallets.filter(
    (w) => typeof w.featured !== "number",
  );

  const orderedWallets: ExternalWalletConfig[] = [
    ...featuredConfigs,
    ...nonFeaturedConfigs,
  ];

  for (const wallet of orderedWallets) {
    const processed = processWallet(wallet, projectId);
    if (!processed) continue;

    addToCollections(
      processed,
      connectors,
      adapters,
      seenConnectors,
      seenAdapters,
    );

    const uiConfig = createUIConfigFromWallet(wallet, processed);
    if (uiConfig) uiWallets.push(uiConfig);
  }

  // Find any WalletConnect projectId for UI config
  let walletConnectProjectId = projectId;
  if (!walletConnectProjectId) {
    // Look for a WalletConnect wallet that has a projectId
    const wcWallet = [...featuredConfigs, ...nonFeaturedConfigs].find(
      (w) => w.type === "WalletConnect" && w.projectId,
    );
    walletConnectProjectId = wcWallet?.projectId;
  }

  return {
    connectors,
    adapters,
    uiConfig: {
      ...(walletConnectProjectId && {
        walletConnect: { projectId: walletConnectProjectId },
      }),
      ...(uiWallets.length > 0 && {
        wallets: uiWallets,
        moreButtonText,
      }),
    },
  };
};

// Helper function to create ExternalWalletUIConfig from WalletConfig and processed data
function createUIConfigFromWallet(
  wallet: ExternalWalletConfig,
  processed: ProcessedWallet,
): ExternalWalletUIConfig | null {
  if (processed.type === "adapter") {
    const adapter = processed.value as WalletAdapter;
    return {
      id: adapter.name,
      type: "solana",
      featured: wallet.featured,
      logoUrl: wallet.logoUrl,
    };
  } else if (processed.type === "connector") {
    // processed.value is the connector function, need to call it to get the instance
    const connectorFunction = processed.value;
    return {
      id: connectorFunction.type,
      type: "evm",
      featured: wallet.featured,
      logoUrl: wallet.logoUrl,
    };
  } else if (
    processed.type === "string" &&
    processed.value === "WalletConnect" &&
    processed.projectId
  ) {
    return {
      id: "WalletConnect",
      type: "walletconnect",
      featured: wallet.featured,
      logoUrl: wallet.logoUrl,
    };
  }
  return null;
}

// Helper function to process individual wallet config
function processWallet(
  wallet: ExternalWalletConfig,
  defaultProjectId?: string,
): ProcessedWallet | null {
  if (wallet.adapter) {
    return { type: "adapter", value: new wallet.adapter() };
  }

  if (wallet.connector) {
    return { type: "connector", value: wallet.connector };
  }

  if (wallet.type === "WalletConnect") {
    const pid = wallet.projectId || defaultProjectId;
    if (!pid) {
      console.warn("WalletConnect wallet specified but no projectId provided");
      return null;
    }
    return { type: "string", value: "WalletConnect", projectId: pid };
  }

  return null;
}

// Helper function to add processed wallet to collections
function addToCollections(
  processed: ProcessedWallet,
  connectors: CreateConnectorFn[],
  adapters: WalletAdapter[],
  seenConnectors: Set<string>,
  seenAdapters: Set<string>,
) {
  if (processed.type === "adapter") {
    const adapter = processed.value as WalletAdapter;
    if (!seenAdapters.has(adapter.name.toLowerCase())) {
      adapters.push(adapter);
      seenAdapters.add(adapter.name.toLowerCase());
    }
  } else if (processed.type === "connector") {
    const connectorFunction = processed.value;
    const connectorInstance = connectorFunction();
    const connectorType = connectorFunction.type || "Unknown";
    if (!seenConnectors.has(connectorType.toLowerCase())) {
      connectors.push(connectorInstance);
      seenConnectors.add(connectorType.toLowerCase());
    }
  } else if (
    processed.type === "string" &&
    processed.value === "WalletConnect" &&
    processed.projectId
  ) {
    // Create WalletConnect connector with specific projectId if not already created
    const wcKey = `walletconnect-${processed.projectId}`;
    if (!seenConnectors.has(wcKey)) {
      connectors.push(walletConnect({ projectId: processed.projectId }));
      seenConnectors.add(wcKey);
    }
  }
}
