import { useCallback } from "react";
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  type PrivyEmbeddedWalletProvider,
} from "@privy-io/expo";
import type { Authorization } from "viem";
import { hashAuthorization } from "viem/utils";
import { parseSignature } from "viem";
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

  useWalletAddress(): string | undefined {
    const { wallets } = useEmbeddedEthereumWallet();
    return wallets?.[0]?.address;
  },

  useAuthorizationSigner() {
    const { wallets } = useEmbeddedEthereumWallet();

    const signAuthorization = useCallback(
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

        // Create the authorization structure (matches Privy's implementation)
        const authorization = {
          chainId: unsignedAuth.chainId,
          address: implementationAddress,
          nonce: unsignedAuth.nonce,
        };

        // Hash the authorization using viem (same as Privy does)
        const authorizationHash = hashAuthorization(authorization);

        // Sign the hash directly with secp256k1_sign (same as Privy)
        const signature = (await provider.request({
          method: "secp256k1_sign",
          params: [authorizationHash],
        })) as `0x${string}`;

        // Parse the signature using viem (same as Privy)
        const parsedSignature = parseSignature(signature);

        return {
          chainId: unsignedAuth.chainId,
          address: implementationAddress,
          nonce: unsignedAuth.nonce,
          ...parsedSignature,
        };
      },
      [wallets],
    );

    return signAuthorization;
  },
};

/**
 * Adapts an Expo wallet to the common EmbeddedWallet interface
 *
 * @param {ExpoEmbeddedWallet} wallet - The Expo embedded wallet to adapt
 * @returns {EmbeddedWallet} The adapted wallet following the common interface
 */
function adaptExpoWallet(wallet: ExpoEmbeddedWallet): EmbeddedWallet {
  // Use closure to maintain up-to-date chain ID across chain switches
  let cachedChainId = wallet.chainId || "1";

  return {
    address: wallet.address as `0x${string}`,
    get chainId() {
      return cachedChainId;
    },
    getEthereumProvider: async () => {
      if (!wallet.getProvider) {
        throw new Error(
          "getProvider is not available on this wallet. Ensure you're using the embedded Ethereum wallet.",
        );
      }
      const provider = await wallet.getProvider();

      // Always fetch current chain ID when provider is accessed
      // This ensures we have the latest chain after wallet_switchEthereumChain calls
      try {
        const currentChainId = (await provider.request({
          method: "eth_chainId",
          params: [],
        })) as string;

        // Convert hex to decimal string format (e.g., "0x1" -> "1")
        cachedChainId = parseInt(currentChainId, 16).toString();
      } catch {
        // Fall back to cached value if fetch fails
        // Chain ID fetch errors are non-critical and can happen during initialization
      }

      return provider;
    },
  };
}
