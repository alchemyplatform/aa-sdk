/**
 * Custom hooks for wallet deduplication and filtering logic
 */

import { useMemo } from "react";
import { useSolanaWallet } from "../useSolanaWallet.js";
import { useConnectEOA } from "../../components/auth/hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../../components/auth/hooks/useWalletConnectAuthConfig.js";
import { useAuthConfig } from "./useAuthConfig.js";
import type { AuthType } from "../../components/auth/types.js";
import type { ExternalWalletUIConfig } from "../../configForExternalWallets.js";

/**
 * Hook to deduplicate EVM connectors
 *
 * @returns {Array} Array of unique EVM connectors
 */
export function useDeduplicatedConnectors() {
  const { connectors } = useConnectEOA();

  return useMemo(() => {
    const uniqueMap = new Map<string, (typeof connectors)[0]>();

    connectors
      .filter((x) => x.type !== "walletConnect")
      .forEach((connector) => {
        const key = connector.name.toLowerCase();

        // If we already have this connector, prefer the explicit one over auto-detected
        // Auto-detected connectors typically have generic IDs, explicit ones have specific types
        if (!uniqueMap.has(key) || connector.type !== "injected") {
          uniqueMap.set(key, connector);
        }
      });

    return Array.from(uniqueMap.values());
  }, [connectors]);
}

/**
 * Hook to filter and deduplicate Solana wallets
 *
 * @returns {Array} Array of filtered Solana wallets
 */
export function useFilteredSolanaWallets() {
  const { wallets } = useSolanaWallet();

  return useMemo(() => {
    // Deduplicate Solana wallets, prioritizing installed ones
    const uniqueMap = new Map<string, (typeof wallets)[0]>();

    wallets.forEach((wallet) => {
      const key = wallet.adapter.name.toLowerCase();
      const existing = uniqueMap.get(key);

      if (!existing) {
        uniqueMap.set(key, wallet);
      } else if (
        wallet.readyState === "Installed" &&
        existing.readyState !== "Installed"
      ) {
        // Replace with installed version if current one is installed and existing isn't
        uniqueMap.set(key, wallet);
      }
      // If both are installed or both are not installed, keep the first one
    });

    const uniqueWallets = Array.from(uniqueMap.values());

    // Filter to only show installed Solana wallets if any are available
    const installedWallets = uniqueWallets.filter(
      (wallet) => wallet.readyState === "Installed",
    );

    // If we have installed wallets, only show those. Otherwise show all unique wallets.
    return installedWallets.length > 0 ? installedWallets : uniqueWallets;
  }, [wallets]);
}

/**
 * Hook to resolve wallet logo URLs from external wallet config
 *
 * @returns {object} Object with logo URL resolver functions
 */
export function useWalletLogoResolver() {
  const externalWalletsConfig = useAuthConfig((auth) => {
    const externalWalletSection = auth.sections
      .find((x) => x.some((y) => y.type === "external_wallets"))
      ?.find((x) => x.type === "external_wallets") as
      | Extract<AuthType, { type: "external_wallets" }>
      | undefined;

    return externalWalletSection;
  });

  return useMemo(() => {
    const getLogoUrlForConnector = (
      connectorType: string,
    ): string | undefined => {
      if (!externalWalletsConfig?.wallets) return undefined;

      const walletConfig = externalWalletsConfig.wallets.find(
        (wallet: ExternalWalletUIConfig) =>
          wallet.type === "evm" && wallet.id === connectorType,
      );
      return walletConfig?.logoUrl;
    };

    const getLogoUrlForAdapter = (adapterName: string): string | undefined => {
      if (!externalWalletsConfig?.wallets) return undefined;

      const walletConfig = externalWalletsConfig.wallets.find(
        (wallet: ExternalWalletUIConfig) =>
          wallet.type === "solana" && wallet.id === adapterName,
      );
      return walletConfig?.logoUrl;
    };

    const getLogoUrlForWalletConnect = (): string | undefined => {
      if (!externalWalletsConfig?.wallets) return undefined;

      const walletConfig = externalWalletsConfig.wallets.find(
        (wallet: ExternalWalletUIConfig) =>
          wallet.type === "walletconnect" && wallet.id === "WalletConnect",
      );
      return walletConfig?.logoUrl;
    };

    return {
      getLogoUrlForConnector,
      getLogoUrlForAdapter,
      getLogoUrlForWalletConnect,
    };
  }, [externalWalletsConfig]);
}

/**
 * Hook to check if wallets are available for display
 *
 * @returns {object} Object with wallet availability flags and filtered wallets
 */
export function useWalletAvailability() {
  const { walletConnectParams } = useWalletConnectAuthConfig();
  const uniqueConnectors = useDeduplicatedConnectors();
  const filteredSolanaWallets = useFilteredSolanaWallets();

  return useMemo(() => {
    const hasWalletConnect = walletConnectParams != null;
    const hasEvmConnectors = uniqueConnectors.length > 0;
    const hasSolanaWallets = filteredSolanaWallets.length > 0;
    const hasAnyWallets =
      hasWalletConnect || hasEvmConnectors || hasSolanaWallets;

    return {
      hasWalletConnect,
      hasEvmConnectors,
      hasSolanaWallets,
      hasAnyWallets,
      uniqueConnectors,
      filteredSolanaWallets,
    };
  }, [walletConnectParams, uniqueConnectors, filteredSolanaWallets]);
}
