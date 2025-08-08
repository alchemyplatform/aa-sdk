import { walletConnect, metaMask, coinbaseWallet } from "wagmi/connectors";
import type { CreateConnectorFn } from "wagmi";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

// Supported wallet names – accept any string. Known names below get built-in handling.
export type SupportedWallet = string;

export type ChainType = "evm" | "svm";

// Wallet configuration types
export interface ExternalWalletUIConfig {
  featured?: number; // Index for featured ordering (0, 1, 2, etc.)
  id: string; // Unique identifier for the wallet
  type: "evm" | "solana" | "walletconnect"; // Type of wallet
}

export interface ConfigForExternalWalletsParams {
  wallets: SupportedWallet[];
  chainType: ChainType[];
  walletConnectProjectId?: string;
  moreButtonText?: string;
  hideMoreButton?: boolean;
  numFeaturedWallet?: number;
}

interface ConfigForExternalWalletsResult {
  connectors: CreateConnectorFn[];
  adapters: WalletAdapter[] | "detect";
  uiConfig: {
    walletConnect?: { projectId: string };
    // New simplified shape (preferred)
    walletNames?: string[];
    chainType?: ChainType[];
    wallets?: ExternalWalletUIConfig[];
    moreButtonText?: string;
    hideMoreButton?: boolean;
    numFeaturedWallet?: number;
  };
}

// Wallet mapping from names to their implementations
type WalletMappingConfig = {
  chains: ChainType[];
  svm?: { adapter: typeof PhantomWalletAdapter | typeof SolflareWalletAdapter };
  evm?:
    | { connector: typeof metaMask | typeof coinbaseWallet }
    | { type: "WalletConnect" };
};

// Built-in support: these will show even if not installed
const WALLET_MAPPINGS: Record<string, WalletMappingConfig> = {
  solflare: {
    chains: ["svm"],
    svm: { adapter: SolflareWalletAdapter },
  },
  metamask: {
    chains: ["evm", "svm"],
    evm: { connector: metaMask },
    // MetaMask supports Solana via Snaps but we'll implement that later
  },
  coinbase: {
    chains: ["evm"],
    evm: { connector: coinbaseWallet },
  },
  wallet_connect: {
    chains: ["evm"],
    evm: { type: "WalletConnect" },
  },
};

// Internal helper type used after normalising a wallet.
type ProcessedWallet =
  | {
      type: "adapter";
      value: WalletAdapter;
      chainType: "svm";
      walletName: string;
    }
  | {
      type: "connector";
      value: typeof metaMask | typeof coinbaseWallet;
      chainType: "evm";
      walletName: string;
    }
  | {
      type: "string";
      value: "WalletConnect";
      projectId: string;
      chainType: "evm";
      walletName: string;
    };

/**
 * Configure external wallets for Account Kit with simplified wallet name-based configuration
 * Handles both EVM connectors and Solana adapters, returns config for core and UI
 *
 * @param {ConfigForExternalWalletsParams} root0 - Configuration parameters object
 * @param {SupportedWallet[]} root0.wallets - Array of wallet names in display order
 * @param {ChainType[]} root0.chainType - Array of supported chain types
 * @param {string} [root0.walletConnectProjectId] - Project ID for WalletConnect
 * @param {string} [root0.moreButtonText] - Text for the "more wallets" button
 * @param {boolean} [root0.hideMoreButton] - Whether to hide the more button
 * @param {number} [root0.numFeaturedWallet] - Number of wallets to show as featured
 * @returns {ConfigForExternalWalletsResult} Object containing connectors, adapters, and UI config
 */
export const configForExternalWallets = ({
  wallets,
  chainType,
  walletConnectProjectId,
  moreButtonText = "More wallets",
  hideMoreButton = false,
  numFeaturedWallet,
}: ConfigForExternalWalletsParams): ConfigForExternalWalletsResult => {
  if (!wallets.length) {
    throw new Error("No wallets provided");
  }

  if (!chainType.length) {
    throw new Error("No chain types provided");
  }

  const connectors: CreateConnectorFn[] = [];
  const adaptersList: WalletAdapter[] = [];
  const uiWallets: ExternalWalletUIConfig[] = [];

  // Track seen wallet names for deduplication
  const seenConnectors = new Set<string>();
  const seenAdapters = new Set<string>();

  // Process wallets in order, expanding each wallet for requested chain types
  for (let walletIndex = 0; walletIndex < wallets.length; walletIndex++) {
    const walletName = wallets[walletIndex];
    const walletConfig = WALLET_MAPPINGS[walletName];

    // Sort chain types to ensure EVM comes before SVM for multi-chain wallets
    const sortedChainTypes = [...chainType].sort((a, b) => {
      if (a === "evm" && b === "svm") return -1;
      if (a === "svm" && b === "evm") return 1;
      return 0;
    });

    // For each requested chain type, check if wallet supports it
    for (const requestedChainType of sortedChainTypes) {
      if (!walletConfig) {
        // Unknown wallet name: allow SVM path to resolve dynamically by presence
        // We only push UI for SVM if an installed wallet matches the name.
        if (requestedChainType === "svm") {
          // Create a UI entry; Solana rendering will filter by installed status.
          uiWallets.push({
            id: walletName,
            type: "solana",
            featured:
              numFeaturedWallet && walletIndex < numFeaturedWallet
                ? walletIndex
                : undefined,
          });
        }
        continue;
      }

      const processed = processWalletForChain(
        walletName,
        requestedChainType,
        walletConnectProjectId,
      );
      if (!processed) continue;

      addToCollections(
        processed,
        connectors,
        adaptersList,
        seenConnectors,
        seenAdapters,
      );

      const uiConfig = createUIConfigFromProcessedWallet(
        processed,
        walletIndex,
        numFeaturedWallet,
      );
      if (uiConfig) uiWallets.push(uiConfig);
    }
  }

  const shouldDetectSolana =
    chainType.includes("svm") && adaptersList.length === 0;

  return {
    connectors,
    adapters: shouldDetectSolana ? "detect" : adaptersList,
    uiConfig: {
      ...(walletConnectProjectId && {
        walletConnect: { projectId: walletConnectProjectId },
      }),
      // Always include the simplified UI config so the UI can render from names
      walletNames: wallets,
      chainType,
      ...(uiWallets.length > 0 && {
        wallets: uiWallets,
        moreButtonText,
        hideMoreButton,
        ...(typeof numFeaturedWallet === "number" && {
          numFeaturedWallet,
        }),
      }),
      // If no legacy wallets array was emitted, still include button labels
      ...(uiWallets.length === 0 && {
        moreButtonText,
        hideMoreButton,
        ...(typeof numFeaturedWallet === "number" && { numFeaturedWallet }),
      }),
    },
  };
};

// Helper function to process a wallet for a specific chain type
function processWalletForChain(
  walletName: string,
  chainType: ChainType,
  walletConnectProjectId?: string,
): ProcessedWallet | null {
  const walletConfig = WALLET_MAPPINGS[walletName];

  if (chainType === "svm" && walletConfig.svm) {
    return {
      type: "adapter",
      value: new walletConfig.svm.adapter(),
      chainType: "svm",
      walletName,
    };
  }

  if (chainType === "evm" && walletConfig.evm) {
    if ("connector" in walletConfig.evm) {
      return {
        type: "connector",
        value: walletConfig.evm.connector,
        chainType: "evm",
        walletName,
      };
    }

    if (walletConfig.evm.type === "WalletConnect") {
      if (!walletConnectProjectId) {
        console.warn(
          "WalletConnect wallet specified but no projectId provided",
        );
        return null;
      }
      return {
        type: "string",
        value: "WalletConnect",
        projectId: walletConnectProjectId,
        chainType: "evm",
        walletName,
      };
    }
  }

  return null;
}

// Helper function to create ExternalWalletUIConfig from processed wallet data
function createUIConfigFromProcessedWallet(
  processed: ProcessedWallet,
  walletIndex: number,
  numFeaturedWallet?: number,
): ExternalWalletUIConfig | null {
  const featured =
    numFeaturedWallet && walletIndex < numFeaturedWallet
      ? walletIndex
      : undefined;

  if (processed.type === "adapter") {
    const adapter = processed.value as WalletAdapter;
    return {
      id: adapter.name,
      type: "solana",
      featured,
    };
  } else if (processed.type === "connector") {
    const connectorFunction = processed.value;
    return {
      id: connectorFunction.type,
      type: "evm",
      featured,
    };
  } else if (
    processed.type === "string" &&
    processed.value === "WalletConnect" &&
    processed.projectId
  ) {
    return {
      id: "WalletConnect",
      type: "walletconnect",
      featured,
    };
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
