import { useCallback } from "react";
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  type PrivyEmbeddedWalletProvider,
} from "@privy-io/expo";
import type { PrivyAdapter, EmbeddedWallet, PrivyAuthState } from "./types.js";

/**
 * Wallet type from @privy-io/expo
 * Based on the example app structure
 */
interface ExpoEmbeddedWallet {
  address: string;
  chainId?: string;
  getProvider?: () => Promise<PrivyEmbeddedWalletProvider>;
}

/**
 * React Native (Expo) adapter for @privy-io/expo
 * Implements platform-specific hooks for React Native applications
 */
export const reactNativeAdapter: PrivyAdapter = {
  useEmbeddedWallet() {
    const { wallets } = useEmbeddedEthereumWallet();

    const getEmbeddedWallet = useCallback((): EmbeddedWallet => {
      const wallet = wallets?.[0];
      if (!wallet) {
        throw new Error(
          "Privy embedded wallet not found. Please ensure the user is authenticated and has created a wallet.",
        );
      }

      return adaptExpoWallet(wallet);
    }, [wallets]);

    return getEmbeddedWallet;
  },

  usePrivyAuth(): PrivyAuthState {
    const { user } = usePrivy();
    return { authenticated: !!user, user };
  },

  // EIP-7702 authorization not available on React Native
  useAuthorizationSigner() {
    return null;
  },
};

/**
 * Adapts an Expo wallet to the common EmbeddedWallet interface
 *
 * @param {ExpoEmbeddedWallet} wallet - The Expo embedded wallet to adapt
 * @returns {EmbeddedWallet} The adapted wallet following the common interface
 */
function adaptExpoWallet(wallet: ExpoEmbeddedWallet): EmbeddedWallet {
  return {
    address: wallet.address as `0x${string}`,
    chainId: wallet.chainId || "1",
    getEthereumProvider: async () => {
      if (!wallet.getProvider) {
        throw new Error(
          "getProvider is not available on this wallet. Ensure you're using the embedded Ethereum wallet.",
        );
      }
      return await wallet.getProvider();
    },
  };
}
