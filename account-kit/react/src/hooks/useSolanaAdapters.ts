"use client";

import { getSolanaConnection } from "@account-kit/core";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { useMemo } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * Hook to get Solana wallet adapters from the core configuration
 * Falls back to default adapters if none are configured
 *
 * @returns {WalletAdapter[]} Array of Solana wallet adapters
 */
export const useSolanaAdapters = (): WalletAdapter[] => {
  const { config } = useAlchemyAccountContext();

  return useMemo(() => {
    const solanaConnection = getSolanaConnection(config);

    // If adapters are provided in the config, use those
    if (solanaConnection?.adapters && solanaConnection.adapters.length > 0) {
      return solanaConnection.adapters;
    }

    // Fall back to default adapters for backward compatibility
    return [];
  }, [config]);
};
