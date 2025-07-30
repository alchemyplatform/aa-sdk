"use client";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { useSolanaAdapters } from "../hooks/useSolanaAdapters.js";
import type { ReactNode } from "react";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const solanaAdapters = useSolanaAdapters();

  return (
    <WalletProvider wallets={solanaAdapters} autoConnect>
      {children}
    </WalletProvider>
  );
}
