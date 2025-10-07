import { useCallback, useEffect, useRef } from "react";
import {
  WalletClientSigner,
  type AuthorizationRequest,
  ConnectionConfigSchema,
} from "@aa-sdk/core";
import {
  createWalletClient,
  custom,
  type Address,
  type Authorization,
} from "viem";
import { useSign7702Authorization, usePrivy } from "@privy-io/react-auth";
import {
  createSmartWalletClient,
  type SmartWalletClient,
} from "@account-kit/wallet-client";
import { alchemy } from "@account-kit/infra";
import { useAlchemyConfig } from "../Provider.js";
import { getChain } from "../util/getChain.js";
import { useEmbeddedWallet } from "./internal/useEmbeddedWallet.js";

/**
 * Module-level cache for the SmartWalletClient
 * This ensures a single client instance is shared across all components
 */
let cachedClient: SmartWalletClient | null = null;

/**
 * Cache key to detect if configuration has changed
 */
let cacheKey: string | null = null;

/**
 * Reset the cached client (useful for testing or logout scenarios)
 *
 * @internal
 */
export function resetClientCache(): void {
  cachedClient = null;
  cacheKey = null;
}

/**
 * Hook to get and memoize a SmartWalletClient instance
 * The client is cached at the module level and shared across all hook instances
 * Automatically clears cache on logout for proper cleanup
 *
 * @returns {{ getClient: () => Promise<SmartWalletClient> }} Object containing the smart wallet client getter
 *
 * @example
 * ```tsx
 * const { client } = useAlchemyClient();
 * const smartWalletClient = await client();
 * ```
 */
export function useAlchemyClient() {
  const { authenticated, user } = usePrivy();
  const { signAuthorization } = useSign7702Authorization();
  const config = useAlchemyConfig();
  const getEmbeddedWallet = useEmbeddedWallet();

  // Track previous authenticated state to detect logout
  const prevAuthenticatedRef = useRef(authenticated);
  const prevWalletAddressRef = useRef(user?.wallet?.address);

  // Automatically reset cache when user logs out or switches wallets
  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current;
    const prevWalletAddress = prevWalletAddressRef.current;
    const currentWalletAddress = user?.wallet?.address;

    // Reset cache on logout
    if (wasAuthenticated && !authenticated) {
      resetClientCache();
    }

    // Reset cache on wallet address change (account switching)
    if (
      authenticated &&
      prevWalletAddress &&
      currentWalletAddress &&
      prevWalletAddress !== currentWalletAddress
    ) {
      resetClientCache();
    }

    // Update refs for next render
    prevAuthenticatedRef.current = authenticated;
    prevWalletAddressRef.current = currentWalletAddress;
  }, [authenticated, user?.wallet?.address]);

  const getEmbeddedWalletChain = useCallback(() => {
    const embedded = getEmbeddedWallet();
    // Handle CAIP-2 format like "eip155:1"
    const chainIdStr = embedded.chainId?.toString();

    if (!chainIdStr) {
      throw new Error(
        "Embedded wallet chainId is not set. Please ensure the wallet is connected to a network.",
      );
    }

    const numericChainId = chainIdStr.includes(":")
      ? chainIdStr.split(":")[1]
      : chainIdStr;

    const parsedChainId = Number(numericChainId);

    if (isNaN(parsedChainId)) {
      throw new Error(
        `Failed to parse chainId from embedded wallet. Received: ${chainIdStr}`,
      );
    }

    return getChain(parsedChainId);
  }, [getEmbeddedWallet]);

  const getClient = useCallback(async (): Promise<SmartWalletClient> => {
    const embeddedWallet = getEmbeddedWallet();
    const chain = getEmbeddedWalletChain();

    // Generate a cache key based on configuration and wallet address
    const currentCacheKey = JSON.stringify({
      address: embeddedWallet.address,
      chainId: chain.id,
      apiKey: config.apiKey,
      jwt: config.jwt,
      rpcUrl: config.rpcUrl,
      policyId: config.policyId,
    });

    // Return cached client if configuration hasn't changed
    if (cachedClient && cacheKey === currentCacheKey) {
      return cachedClient;
    }

    // Configuration changed or no cache exists, create new client
    const provider = await embeddedWallet.getEthereumProvider();

    // Create base signer from Privy wallet
    const baseSigner = new WalletClientSigner(
      createWalletClient({
        account: embeddedWallet.address as Address,
        chain,
        transport: custom(provider),
      }),
      "privy",
    );

    // Extend signer with EIP-7702 authorization support
    const signer = {
      ...baseSigner,
      signAuthorization: async (
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
    };

    // Determine transport configuration using schema validation
    // This properly handles combinations like rpcUrl + jwt together
    const transportConfig = ConnectionConfigSchema.parse({
      rpcUrl: config.rpcUrl,
      apiKey: config.apiKey,
      jwt: config.jwt,
    });

    // Create and cache the smart wallet client at module level
    cachedClient = createSmartWalletClient({
      chain,
      transport: alchemy(transportConfig),
      signer,
      policyIds: config.policyId
        ? Array.isArray(config.policyId)
          ? config.policyId
          : [config.policyId]
        : undefined,
    });

    // Store the cache key
    cacheKey = currentCacheKey;

    return cachedClient;
  }, [
    getEmbeddedWallet,
    getEmbeddedWalletChain,
    signAuthorization,
    config.apiKey,
    config.jwt,
    config.rpcUrl,
    config.policyId,
  ]);

  return { getClient };
}
