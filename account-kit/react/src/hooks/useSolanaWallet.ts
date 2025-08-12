"use client";

import {
  WalletContext,
  type WalletContextState,
} from "@solana/wallet-adapter-react";
import { useContext } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

const rejectNotAvailable = () =>
  Promise.reject(new Error("Solana wallet not available"));

export const EMPTY_WALLET_CONTEXT_STATE: WalletContextState = Object.freeze({
  // connection flags
  connected: false,
  connecting: false,
  disconnecting: false,

  // wallet identity
  publicKey: null,
  wallets: [],
  wallet: null,
  signIn: rejectNotAvailable,

  // imperative helpers
  select: () => {},
  connect: rejectNotAvailable,
  disconnect: () => Promise.resolve(),
  sendTransaction: rejectNotAvailable,
  signTransaction: rejectNotAvailable,
  signAllTransactions: rejectNotAvailable,
  signMessage: rejectNotAvailable,

  // misc
  autoConnect: false,
});

export function useSolanaWallet(): WalletContextState {
  const solana = useAlchemyAccountContext().config.solana;
  const ctx = useContext(WalletContext);
  const adapters = solana?.adapters;

  // Use a module-level constant for stable identity when Solana is not configured
  if ((adapters && adapters.length > 0) || adapters === "detect") {
    return ctx;
  }
  return EMPTY_WALLET_CONTEXT_STATE;
}
