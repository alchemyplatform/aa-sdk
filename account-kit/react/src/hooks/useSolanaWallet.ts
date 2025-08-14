"use client";

import {
  WalletContext,
  type WalletContextState,
} from "@solana/wallet-adapter-react";
import { useContext } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

const rejectNotAvailable = () =>
  Promise.reject(new Error("Solana wallet not available"));

/**
 * A frozen, no-op implementation of `WalletContextState` returned when Solana
 * support is not configured in the current app. All imperative methods either
 * resolve immediately or reject with a clear error, and connection flags are
 * set to their safe defaults.
 */
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

/**
 * A React hook that mirrors the behavior and return type of
 * `useWallet` from `@solana/wallet-adapter-react`, but safely degrades when
 * Solana is not enabled for your application.
 *
 * Context:
 * - This repository is an external SDK that supports multiple chains. To avoid
 *   forcing Solana dependencies on apps that do not use Solana, the Solana
 *   wallet context is only considered "active" if Solana has been initialized
 *   in the `AlchemyAccountProvider` configuration.
 * - If Solana is not initialized, this hook returns a stable, frozen
 *   `EMPTY_WALLET_CONTEXT_STATE` instead of reading from `WalletContext`. This
 *   prevents runtime errors when the Solana provider is not present and keeps
 *   type-safe parity with `useWallet` consumers.
 *
 * Behavior:
 * - When Solana is configured (i.e. adapters are provided or set to "detect"),
 *   this hook returns the live `WalletContext` from
 *   `@solana/wallet-adapter-react`.
 * - Otherwise, it returns `EMPTY_WALLET_CONTEXT_STATE` where actions such as
 *   `signMessage`, `sendTransaction`, etc., will reject with
 *   "Solana wallet not available".
 *
 * @returns {WalletContextState} The Solana wallet context when enabled; a
 *   frozen, safe no-op context when Solana is not configured.
 *
 * @example
 * ```ts
 * import { useSolanaWallet } from "@account-kit/react";
 *
 * const wallet = useSolanaWallet();
 *
 * if (wallet.connected) {
 *   // Safe to use wallet.publicKey, sendTransaction, etc.
 * } else {
 *   // Solana not configured or not connected; UI can conditionally render.
 * }
 * ```
 */
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
