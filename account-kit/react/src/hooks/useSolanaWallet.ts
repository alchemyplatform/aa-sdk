"use client";

import {
  WalletContext,
  type WalletContextState,
} from "@solana/wallet-adapter-react";
import { useContext, useMemo } from "react";

function createEmptyState(): WalletContextState {
  const err = () => Promise.reject(new Error("Solana wallet not available"));

  return {
    // connection flags
    connected: false,
    connecting: false,
    disconnecting: false,

    // wallet identity
    publicKey: null,
    wallets: [],
    wallet: null,
    signIn: err,

    // imperative helpers
    select: () => {},
    connect: err,
    disconnect: () => Promise.resolve(),
    sendTransaction: err,
    signTransaction: err,
    signAllTransactions: err,
    signMessage: err,

    // misc
    autoConnect: false,
  };
}

export function useSolanaWallet(): WalletContextState {
  // ✅ hook is called on every render – no conditional branch
  const ctx = useContext(WalletContext);

  // Memoise so the empty object identity is stable
  return useMemo(() => ctx ?? createEmptyState(), [ctx]);
}
