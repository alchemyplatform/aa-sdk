import { metaMask, coinbaseWallet } from "wagmi/connectors";
import type { CreateConnectorFn } from "wagmi";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

export type ChainType = "evm" | "svm";

export interface ConfigForExternalWalletsParams {
  wallets: string[];
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
    wallets: string[];
    chainType: ChainType[];
    moreButtonText: string;
    hideMoreButton: boolean;
    numFeaturedWallet?: number;
  };
}

// Built-in wallet configurations
const WALLETS = {
  solflare: {
    svm: () => new SolflareWalletAdapter(),
  },
  metamask: {
    evm: () => metaMask(),
  },
  "coinbase wallet": {
    evm: () => coinbaseWallet(),
  },
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

  // Sort chain types once: EVM first, then SVM
  const sortedChainTypes = [...chainType].sort((a, b) =>
    a === "evm" && b === "svm" ? -1 : a === "svm" && b === "evm" ? 1 : 0,
  );

  // Process each wallet for each chain type
  for (const walletName of wallets) {
    const walletConfig = WALLETS[walletName as keyof typeof WALLETS];
    if (!walletConfig) continue; // Unknown wallet, skip

    for (const chain of sortedChainTypes) {
      if (chain === "svm" && "svm" in walletConfig && walletConfig.svm) {
        adaptersList.push(walletConfig.svm());
      } else if (chain === "evm" && "evm" in walletConfig && walletConfig.evm) {
        connectors.push(walletConfig.evm());
      }
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
      wallets,
      chainType,
      moreButtonText,
      hideMoreButton,
      ...(typeof numFeaturedWallet === "number" && {
        numFeaturedWallet,
      }),
    },
  };
};
