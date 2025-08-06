"use client";

import {
  WalletContext,
  type WalletContextState,
} from "@solana/wallet-adapter-react";
import { useContext, useMemo } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

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
  const solana = useAlchemyAccountContext().config.solana;
  const ctx = useContext(WalletContext);
  const adapters = solana?.adapters;

  // Memoise so the empty object identity is stable
  return useMemo(() => {
    if ((adapters && adapters.length > 0) || adapters === "detect") {
      return ctx;
    }
    return createEmptyState();
  }, [ctx, adapters]);
}
