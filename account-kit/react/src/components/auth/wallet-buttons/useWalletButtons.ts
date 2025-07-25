import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import { WALLET_CONNECT } from "../card/eoa.js";
import type { WalletInfo } from "./types.js";
import type { Connector } from "wagmi";

export interface UseWalletButtonsOptions {
  inlineWallets?: WalletConfig[];
  maxInlineCount?: number;
}

export interface WalletConfig {
  featured?: number;
  adapter?: any;
  connector?: any;
  type?: "WalletConnect";
  logoUrl?: string;
  projectId?: string;
}

export interface UseWalletButtonsResult {
  inlineWallets: WalletConfig[];
  remainingWallets: WalletInfo[];
  hasMoreWallets: boolean;
  allWallets: WalletInfo[];
}

export const useWalletButtons = ({
  inlineWallets = [],
  maxInlineCount,
}: UseWalletButtonsOptions = {}): UseWalletButtonsResult => {
  const { connectors } = useConnectEOA();
  const { wallets } = useWallet();
  const { walletConnectParams } = useWalletConnectAuthConfig();

  const allWallets = useMemo((): WalletInfo[] => {
    const walletList: WalletInfo[] = [];

    // Add EVM connectors (excluding WalletConnect) with deduplication
    const uniqueConnectors = new Map<string, Connector>();

    connectors
      .filter((x) => x.type !== WALLET_CONNECT)
      .forEach((connector) => {
        const key = connector.name.toLowerCase();

        // If we already have this connector, prefer the explicit one over auto-detected
        // Auto-detected connectors typically have generic IDs, explicit ones have specific types
        if (!uniqueConnectors.has(key) || connector.type !== "injected") {
          uniqueConnectors.set(key, connector);
        }
      });

    // Convert unique connectors to wallet list
    uniqueConnectors.forEach((connector) => {
      walletList.push({
        id: connector.name,
        name: connector.name,
        icon: connector.icon,
        type: "evm",
        connector,
      });
    });

    // Add WalletConnect if available
    if (walletConnectParams) {
      walletList.push({
        id: "WalletConnect",
        name: "WalletConnect",
        type: "walletconnect",
      });
    }

    // Add Solana wallets (these shouldn't have duplicates)
    wallets.forEach((wallet) => {
      walletList.push({
        id: wallet.adapter.name,
        name: wallet.adapter.name,
        icon: wallet.adapter.icon,
        type: "solana",
        adapter: wallet.adapter,
      });
    });

    return walletList;
  }, [connectors, wallets, walletConnectParams]);

  const { remainingWalletsList } = useMemo(() => {
    if (inlineWallets.length === 0) {
      // If no specific wallets are specified
      if (maxInlineCount === undefined) {
        // No limit specified - show all wallets inline
        return {
          inlineWalletsList: allWallets,
          remainingWalletsList: [],
        };
      } else {
        // Limit specified - show first N wallets inline
        return {
          //   inlineWalletsList: allWallets.slice(0, maxInlineCount),
          remainingWalletsList: allWallets.slice(maxInlineCount),
        };
      }
    }

    // Create ordered list based on inlineWallets specification
    // const inline: WalletInfo[] = [];
    const remaining: WalletInfo[] = [...allWallets];

    // inlineWallets.forEach((walletConfig) => {
    //   if (maxInlineCount !== undefined && inline.length >= maxInlineCount)
    //     return;

    //   let matchedWallet: WalletInfo | undefined;

    //   if (walletConfig.adapter) {
    //     // Solana adapter - match by adapter name
    //     const adapterInstance = new walletConfig.adapter();
    //     matchedWallet = remaining.find(
    //       (w) => w.type === "solana" && w.name === adapterInstance.name,
    //     );
    //   } else if (walletConfig.connector) {
    //     // EVM connector - match by connector name
    //     matchedWallet = walletConfig;
    //   } else if (walletConfig.type === "WalletConnect") {
    //     // WalletConnect - match by type
    //     matchedWallet = remaining.find((w) => w.type === "walletconnect");
    //   }

    //   if (matchedWallet) {
    //     inline.push(matchedWallet);
    //     // Remove from remaining
    //     const index = remaining.indexOf(matchedWallet);
    //     if (index > -1) {
    //       remaining.splice(index, 1);
    //     }
    //   }
    // });

    return {
      inlineWalletsList: inlineWallets,
      remainingWalletsList: remaining,
    };
  }, [allWallets, inlineWallets, maxInlineCount]);

  return {
    inlineWallets,
    remainingWallets: remainingWalletsList,
    hasMoreWallets: remainingWalletsList.length > 0,
    allWallets,
  };
};
