import { useCallback } from "react";
import {
  useWallets,
  type ConnectedWallet as PrivyWallet,
} from "@privy-io/react-auth";

/**
 * Internal hook to get the Privy embedded wallet
 * Shared across multiple hooks to avoid duplication
 *
 * @internal
 * @returns {() => PrivyWallet} Function that returns the embedded wallet
 * @throws {Error} If embedded wallet is not found
 */
export function useEmbeddedWallet() {
  const { wallets } = useWallets();

  const getEmbeddedWallet = useCallback((): PrivyWallet => {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) {
      throw new Error(
        "Privy embedded wallet not found. Please ensure the user is authenticated.",
      );
    }
    return embedded;
  }, [wallets]);

  return getEmbeddedWallet;
}
