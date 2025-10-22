import { useCallback } from "react";
import { WalletClientSigner, ConnectionConfigSchema } from "@aa-sdk/core";
import { createWalletClient, custom, type Address } from "viem";
import {
  createSmartWalletClient,
  type SmartWalletClient,
} from "@account-kit/wallet-client";
import { alchemy } from "@account-kit/infra";
import {
  useAlchemyConfig,
  useClientCache,
  useAdapter,
} from "../context/AlchemyContext.js";
import { getChain } from "../util/getChain.js";
import { useEmbeddedWallet } from "./internal/useEmbeddedWallet.js";

/**
 * Hook to get and memoize a SmartWalletClient instance
 * The client is cached in the AlchemyProvider context (React tree scoped)
 * Automatically clears cache on logout via the provider
 *
 * @returns {{ getClient: () => Promise<SmartWalletClient> }} Object containing the smart wallet client getter
 *
 * @example
 * ```tsx
 * const { getClient } = useAlchemyClient();
 * const smartWalletClient = await getClient();
 * ```
 */
export function useAlchemyClient() {
  const adapter = useAdapter();
  const signAuthorizationFn = adapter.useAuthorizationSigner?.() || null;
  const config = useAlchemyConfig();
  const cache = useClientCache();
  const getEmbeddedWallet = useEmbeddedWallet();

  const getClient = useCallback(async (): Promise<SmartWalletClient> => {
    const embeddedWallet = getEmbeddedWallet();

    // IMPORTANT: Get provider FIRST to ensure chain ID is updated
    // The provider fetch triggers chain ID update in the adapter
    const provider = await embeddedWallet.getEthereumProvider();

    // NOW get the chain from the SAME wallet instance with updated chain ID
    // Handle CAIP-2 format like "eip155:1"
    const chainIdStr = embeddedWallet.chainId?.toString();

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

    const chain = getChain(parsedChainId);

    // Generate a cache key based on configuration and wallet address
    // IMPORTANT: Include whether authorization signer is available in cache key
    const currentCacheKey = JSON.stringify({
      address: embeddedWallet.address,
      chainId: chain.id,
      apiKey: config.apiKey,
      jwt: config.jwt,
      rpcUrl: config.rpcUrl,
      policyId: config.policyId,
      hasAuthSigner: !!signAuthorizationFn,
    });

    // Return cached client if configuration hasn't changed
    if (cache.client && cache.cacheKey === currentCacheKey) {
      return cache.client;
    }

    // Configuration changed or no cache exists, create new client

    // Create base signer from Privy wallet
    const baseSigner = new WalletClientSigner(
      createWalletClient({
        account: embeddedWallet.address as Address,
        chain,
        transport: custom(provider),
      }),
      "privy",
    );

    // Extend signer with EIP-7702 authorization support (if available)
    const signer = signAuthorizationFn
      ? {
          ...baseSigner,
          signAuthorization: signAuthorizationFn,
        }
      : baseSigner;

    console.log(
      "[useAlchemyClient] Created signer with authorization support:",
      !!signAuthorizationFn,
    );

    // Determine transport configuration using schema validation
    // This properly handles combinations like rpcUrl + jwt together
    const transportConfig = ConnectionConfigSchema.parse({
      rpcUrl: config.rpcUrl,
      apiKey: config.apiKey,
      jwt: config.jwt,
    });

    const transport = alchemy(transportConfig);

    transport.updateHeaders({
      "X-Alchemy-Client-Breadcrumb": "privyIntegrationSdk",
    });

    // Create and cache the smart wallet client in provider context
    cache.client = createSmartWalletClient({
      chain,
      transport,
      signer,
      policyIds: config.policyId
        ? Array.isArray(config.policyId)
          ? config.policyId
          : [config.policyId]
        : undefined,
    });

    // Store the cache key
    cache.cacheKey = currentCacheKey;

    return cache.client;
  }, [
    getEmbeddedWallet,
    signAuthorizationFn,
    config.apiKey,
    config.jwt,
    config.rpcUrl,
    config.policyId,
    cache,
  ]);

  return { getClient };
}
