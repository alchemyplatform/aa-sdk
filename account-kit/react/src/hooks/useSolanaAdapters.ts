"use client";

import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * Hook to get configured Solana wallet adapters from the config
 *
 * @returns {WalletAdapter[]} Array of configured Solana wallet adapters
 */
export function useSolanaAdapters(): WalletAdapter[] {
  const { config } = useAlchemyAccountContext();

  const adapters = config.solana?.adapters || [];

  return adapters;
}
