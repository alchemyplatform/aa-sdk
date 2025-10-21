import { useCallback } from "react";
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  type PrivyEmbeddedWalletProvider,
} from "@privy-io/expo";
import type { Authorization } from "viem";
import type { AuthorizationRequest } from "@aa-sdk/core";
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

  useAuthorizationSigner() {
    const { wallets } = useEmbeddedEthereumWallet();

    return useCallback(
      async (
        unsignedAuth: AuthorizationRequest<number>,
      ): Promise<Authorization<number, true>> => {
        const wallet = wallets?.[0];
        if (!wallet) {
          throw new Error(
            "Privy embedded wallet not found. Please ensure the user is authenticated and has created a wallet.",
          );
        }

        const provider = await wallet.getProvider?.();
        if (!provider) {
          throw new Error(
            "Provider not available on this wallet. Ensure you're using the embedded Ethereum wallet.",
          );
        }

        // Extract the implementation address (handle both 'address' and 'contractAddress' fields)
        const implementationAddress =
          unsignedAuth.address ?? unsignedAuth.contractAddress;

        if (!implementationAddress) {
          throw new Error(
            "Implementation address is required for EIP-7702 authorization",
          );
        }

        // EIP-7702 Authorization structure
        const authorization = {
          domain: {
            name: "EIP-7702",
            version: "1",
            chainId: unsignedAuth.chainId,
          },
          types: {
            Authorization: [
              { name: "chainId", type: "uint256" },
              { name: "address", type: "address" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "Authorization" as const,
          message: {
            chainId: unsignedAuth.chainId,
            address: implementationAddress,
            nonce: unsignedAuth.nonce,
          },
        };

        const signature = (await provider.request({
          method: "eth_signTypedData_v4",
          params: [wallet.address, JSON.stringify(authorization)],
        })) as `0x${string}`;

        // Parse the signature into r, s, v components
        // Signature format: 0x[r(64)][s(64)][v(2)]
        const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
        const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
        const v = parseInt(signature.slice(130, 132), 16);

        // Convert v to yParity (0 or 1)
        // v can be 27/28 (legacy) or 0/1 (EIP-155)
        const yParity = v >= 27 ? v - 27 : v;

        return {
          chainId: unsignedAuth.chainId,
          address: implementationAddress,
          nonce: unsignedAuth.nonce,
          r,
          s,
          yParity,
        };
      },
      [wallets],
    );
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
