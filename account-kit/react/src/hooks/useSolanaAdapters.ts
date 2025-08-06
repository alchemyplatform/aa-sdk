"use client";

import { useMemo } from "react";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * Hook to get configured Solana wallet adapters
 * Supports both explicit adapter arrays and "detect" mode for auto-detection
 *
 * @returns {WalletAdapter[]} Array of configured wallet adapters
 */
export function useSolanaAdapters(): WalletAdapter[] {
  const { config } = useAlchemyAccountContext();

  return useMemo(() => {
    const solanaConfig = config.solana;

    if (!solanaConfig) {
      return [];
    }

    return (solanaConfig.adapters as WalletAdapter[]) || [];
  }, [config.solana]);
}
