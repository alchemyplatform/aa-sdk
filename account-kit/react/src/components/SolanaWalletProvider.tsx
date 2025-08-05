"use client";

import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { useSolanaAdapters } from "../hooks/useSolanaAdapters.js";
import { useAlchemyAccountContext } from "../hooks/useAlchemyAccountContext.js";
import type { ReactNode } from "react";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const { connection } = useAlchemyAccountContext().config.solana!;
  const wallets = useSolanaAdapters();

  return (
    <ConnectionProvider endpoint={connection.rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
