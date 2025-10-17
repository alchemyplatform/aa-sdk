import { useCallback } from "react";
import {
  useWallets,
  usePrivy,
  useSign7702Authorization,
  type ConnectedWallet as PrivyWallet,
} from "@privy-io/react-auth";
import type { Authorization } from "viem";
import type { AuthorizationRequest } from "@aa-sdk/core";
import type { PrivyAdapter, EmbeddedWallet, PrivyAuthState } from "./types.js";

/**
 * Web adapter for @privy-io/react-auth
 * Implements platform-specific hooks for React web applications
 */
export const webAdapter: PrivyAdapter = {
  useEmbeddedWallet() {
    const { wallets } = useWallets();

    const getEmbeddedWallet = useCallback((): EmbeddedWallet => {
      const embedded = wallets.find((w) => w.walletClientType === "privy");
      if (!embedded) {
        throw new Error(
          "Privy embedded wallet not found. Please ensure the user is authenticated.",
        );
      }

      return adaptWebWallet(embedded);
    }, [wallets]);

    return getEmbeddedWallet;
  },

  usePrivyAuth(): PrivyAuthState {
    const { user } = usePrivy();
    return { authenticated: !!user, user };
  },

  useAuthorizationSigner() {
    const { signAuthorization } = useSign7702Authorization();

    return useCallback(
      async (
        unsignedAuth: AuthorizationRequest<number>,
      ): Promise<Authorization<number, true>> => {
        const signature = await signAuthorization({
          ...unsignedAuth,
          contractAddress: unsignedAuth.address ?? unsignedAuth.contractAddress,
        });

        return {
          ...unsignedAuth,
          ...signature,
        };
      },
      [signAuthorization],
    );
  },
};

/**
 * Adapts a Privy web wallet to the common EmbeddedWallet interface
 *
 * @param {PrivyWallet} wallet - The Privy web wallet to adapt
 * @returns {EmbeddedWallet} The adapted wallet following the common interface
 */
function adaptWebWallet(wallet: PrivyWallet): EmbeddedWallet {
  return {
    address: wallet.address as `0x${string}`,
    chainId: wallet.chainId || "1",
    getEthereumProvider: () => wallet.getEthereumProvider(),
  };
}
