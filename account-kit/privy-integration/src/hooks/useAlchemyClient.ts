import { useCallback } from "react";
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
import { useSign7702Authorization } from "@privy-io/react-auth";
import {
  createSmartWalletClient,
  type SmartWalletClient,
} from "@account-kit/wallet-client";
import { alchemy } from "@account-kit/infra";
import { useAlchemyConfig, useClientCache } from "../Provider.js";
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
  const { signAuthorization } = useSign7702Authorization();
  const config = useAlchemyConfig();
  const cache = useClientCache();
  const getEmbeddedWallet = useEmbeddedWallet();

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
    if (cache.client && cache.cacheKey === currentCacheKey) {
      return cache.client;
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

    // Create and cache the smart wallet client in provider context
    cache.client = createSmartWalletClient({
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
    cache.cacheKey = currentCacheKey;

    return cache.client;
  }, [
    getEmbeddedWallet,
    getEmbeddedWalletChain,
    signAuthorization,
    config.apiKey,
    config.jwt,
    config.rpcUrl,
    config.policyId,
    cache,
  ]);

  return { getClient };
}
