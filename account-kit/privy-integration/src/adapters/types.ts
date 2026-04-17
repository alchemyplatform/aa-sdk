import type { Address, Authorization } from "viem";
import type { AuthorizationRequest } from "@aa-sdk/core";

/**
 * Platform-agnostic embedded wallet interface
 * Abstracts differences between @privy-io/react-auth and @privy-io/expo
 */
export interface EmbeddedWallet {
  /** Wallet address */
  address: Address;

  /** Chain ID as a string (may be CAIP-2 format like "eip155:1" or numeric string like "1") */
  chainId: string;

  /** Get EVM provider for the wallet */
  getEthereumProvider(): Promise<any>;
}

/**
 * Platform-agnostic Privy auth state
 */
export interface PrivyAuthState {
  /** Whether user is authenticated */
  authenticated: boolean;

  /** User object (platform-specific, used for cache invalidation) */
  user: any;
}

/**
 * Adapter interface that each platform must implement
 * Provides platform-specific Privy functionality
 */
export interface PrivyAdapter {
  /**
   * Hook to get embedded wallet
   * Must be called as a React hook (follows rules of hooks)
   *
   * @param preferredAddress - Optional address to find a specific wallet
   */
  useEmbeddedWallet(preferredAddress?: string): () => EmbeddedWallet;

  /**
   * Hook to get Privy authentication state
   * Must be called as a React hook (follows rules of hooks)
   */
  usePrivyAuth(): PrivyAuthState;

  /**
   * Hook to get current wallet address (for cache invalidation)
   * Returns undefined if no wallet is available
   * Must be called as a React hook (follows rules of hooks)
   *
   * @param preferredAddress - Optional address to find a specific wallet
   */
  useWalletAddress(preferredAddress?: string): string | undefined;

  /**
   * Hook to get EIP-7702 authorization signer (optional, web only)
   * Must be called as a React hook (follows rules of hooks)
   *
   * @param preferredAddress - Optional address to find a specific wallet
   */
  useAuthorizationSigner?(
    preferredAddress?: string,
  ):
    | ((
        auth: AuthorizationRequest<number>,
      ) => Promise<Authorization<number, true>>)
    | null;
}
