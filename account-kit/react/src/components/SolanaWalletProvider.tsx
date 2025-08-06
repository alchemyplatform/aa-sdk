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
  const solana = useAlchemyAccountContext().config.solana;
  const walletsAdapters = useSolanaAdapters();

  // Short-circuit if no Solana adapters - connection may still be needed for embedded wallets
  if (
    !solana ||
    !solana.adapters ||
    (Array.isArray(solana.adapters) && solana.adapters.length === 0)
  ) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={solana.connection.rpcEndpoint}>
      <WalletProvider wallets={walletsAdapters} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
