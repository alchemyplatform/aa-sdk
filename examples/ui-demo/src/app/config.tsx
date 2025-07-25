import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { cookieStorage, createConfig } from "@account-kit/react";
import { AccountKitTheme } from "@account-kit/react/tailwind";
import { type KnownAuthProvider } from "@account-kit/signer";
import { Connection } from "@solana/web3.js";
import { QueryClient } from "@tanstack/react-query";
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

export interface WalletConfig {
  featured?: number; // Index for featured ordering (0, 1, 2, etc.)
  adapter?: typeof PhantomWalletAdapter | typeof SolflareWalletAdapter; // Solana adapter class
  connector?: typeof metaMask | typeof coinbaseWallet; // EVM connector function
  type?: "WalletConnect"; // Built-in wallet types
  logoUrl?: string; // Custom logo URL
  projectId?: string; // For WalletConnect
}

interface ConfigForExternalWalletsParams {
  wallets: WalletConfig[];
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
    // featuredWallets?: {
    //   wallets: WalletConfig[];
    //   moreButtonText?: string;
    // };
  };
}

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

  // Separate featured and non-featured wallets
  const featuredConfigs: (WalletConfig & { featured: number })[] = [];
  const nonFeaturedConfigs: WalletConfig[] = [];

  for (const wallet of wallets) {
    if (typeof wallet.featured === "number") {
      featuredConfigs.push(wallet as WalletConfig & { featured: number });
    } else {
      nonFeaturedConfigs.push(wallet);
    }
  }

  // Sort featured wallets by their featured index
  featuredConfigs.sort((a, b) => a.featured - b.featured);

  // Process featured wallets first
  for (const wallet of featuredConfigs) {
    const processed = processWallet(wallet, projectId);
    if (processed) {
      addToCollections(
        processed,
        connectors,
        adapters,
        seenConnectors,
        seenAdapters,
      );

      // Create UI config entry
      const uiConfig = createUIConfigFromWallet(wallet, processed);
      if (uiConfig) {
        uiWallets.push(uiConfig);
      }
    }
  }

  // Process non-featured wallets
  for (const wallet of nonFeaturedConfigs) {
    const processed = processWallet(wallet, projectId);
    if (processed) {
      addToCollections(
        processed,
        connectors,
        adapters,
        seenConnectors,
        seenAdapters,
      );

      // Create UI config entry
      const uiConfig = createUIConfigFromWallet(wallet, processed);
      if (uiConfig) {
        uiWallets.push(uiConfig);
      }
    }
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
  wallet: WalletConfig,
  processed: {
    type: "adapter" | "connector" | "string";
    value: any;
    projectId?: string;
  },
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
  wallet: WalletConfig,
  defaultProjectId?: string,
): {
  type: "adapter" | "connector" | "string";
  value: any;
  projectId?: string;
} | null {
  if (wallet.adapter) {
    return { type: "adapter", value: new wallet.adapter() };
  } else if (wallet.connector) {
    return { type: "connector", value: wallet.connector };
  } else if (wallet.type === "WalletConnect") {
    const pid = wallet.projectId || defaultProjectId;
    if (!pid) {
      console.warn("WalletConnect wallet specified but no projectId provided");
      return null;
    }
    // Return the projectId so we can create the appropriate connector
    return { type: "string", value: "WalletConnect", projectId: pid };
  }
  return null;
}

// Helper function to add processed wallet to collections
function addToCollections(
  processed: {
    type: "adapter" | "connector" | "string";
    value: any;
    projectId?: string;
  },
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

export type Config = {
  auth: {
    showEmail: boolean;
    showExternalWallets: boolean;
    showPasskey: boolean;
    addPasskey: boolean;
    showOAuth: boolean;
    oAuthMethods: Record<
      KnownAuthProvider | "auth0" | "twitter" | "discord",
      boolean
    >;
  };
  ui: {
    theme: "light" | "dark";
    primaryColor: {
      dark: string;
      light: string;
    };
    borderRadius: AccountKitTheme["borderRadius"];
    illustrationStyle: "outline" | "linear" | "filled" | "flat";
    logoLight:
      | {
          fileName: string;
          fileSrc: string;
        }
      | undefined;
    logoDark:
      | {
          fileName: string;
          fileSrc: string;
        }
      | undefined;
  };
  accountMode: AccountMode;
  supportUrl?: string;
};

export type AccountMode = "default" | "7702";

export const DEFAULT_CONFIG: Config = {
  auth: {
    showEmail: true,
    showExternalWallets: true,
    showPasskey: true,
    addPasskey: false,
    showOAuth: true,
    oAuthMethods: {
      google: true,
      facebook: true,
      twitch: true,
      auth0: false,
      apple: false,
      discord: true,
      twitter: true,
      // TO DO: extend for BYO auth provider
    },
  },
  ui: {
    theme: "light",
    primaryColor: {
      light: "#E82594",
      dark: "#FF66CC",
    },
    borderRadius: "sm",
    illustrationStyle: "outline",
    logoLight: undefined,
    logoDark: undefined,
  },
  accountMode: "default",
};

export const queryClient = new QueryClient();
const solanaConnection = new Connection(
  `${
    (global || window)?.location?.origin || "http://localhost:3000"
  }/api/rpc/solana`,
  {
    wsEndpoint: "wss://api.devnet.solana.com",
    commitment: "confirmed",
  },
);

// Configure external wallets using the new function
export const externalWalletsConfig = configForExternalWallets({
  wallets: [
    {
      featured: 0,
      adapter: PhantomWalletAdapter,
    },
    {
      featured: 1,
      connector: metaMask,
      logoUrl: "/images/discord.svg",
    },
    {
      featured: 2,
      type: "WalletConnect",
      projectId: "30e7ffaff99063e68cc9870c105d905b",
    },
    {
      adapter: SolflareWalletAdapter,
    },
    {
      connector: coinbaseWallet,
    },
  ],
  // moreButtonText: "More wallet options",
});

export const alchemyConfig = () => {
  return createConfig(
    {
      transport: alchemy({ rpcUrl: "/api/rpc" }),
      chain: arbitrumSepolia,
      chains: [
        {
          chain: arbitrumSepolia,
          transport: alchemy({ rpcUrl: "/api/rpc" }),
          policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
        },
        {
          chain: baseSepolia,
          transport: alchemy({ rpcUrl: "/api/rpc-base-sepolia" }),
          policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
        },
      ],
      ssr: true,
      connectors:
        typeof window === "undefined"
          ? undefined
          : externalWalletsConfig.connectors,
      storage: cookieStorage,
      enablePopupOauth: true,
      // Core config: Define which Solana adapters are available
      solana: {
        connection: solanaConnection,
        policyId: process.env.NEXT_PUBLIC_SOLANA_POLICY_ID,
        adapters: externalWalletsConfig.adapters,
      },
    },
    {
      illustrationStyle: DEFAULT_CONFIG.ui.illustrationStyle,
      auth: {
        sections: [
          [{ type: "email" }],
          [
            { type: "passkey" },
            { type: "social", authProviderId: "google", mode: "popup" },
            { type: "social", authProviderId: "facebook", mode: "popup" },
          ],
          [
            {
              type: "external_wallets",
              ...externalWalletsConfig.uiConfig,
            } as any, // Temporary cast until types are compiled
          ],
        ],
        addPasskeyOnSignup: DEFAULT_CONFIG.auth.addPasskey,
        header: (
          <AuthCardHeader
            theme={DEFAULT_CONFIG.ui.theme}
            logoDark={DEFAULT_CONFIG.ui.logoDark}
            logoLight={DEFAULT_CONFIG.ui.logoLight}
          />
        ),
      },
      uiMode: "embedded",
    },
  );
};
