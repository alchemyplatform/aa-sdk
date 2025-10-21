import { useCallback } from "react";
import {
  WalletClientSigner,
  type AuthorizationRequest,
  ConnectionConfigSchema,
  type SmartContractAccount,
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

export type AlchemyClientResult = {
  client: SmartWalletClient;
  account: SmartContractAccount;
};

/**
 * Hook to get and memoize a SmartWalletClient instance with its associated account
 * The client and account are cached in the AlchemyProvider context (React tree scoped)
 * Automatically clears cache on logout via the provider
 *
 * @returns {{ getClient: () => Promise<AlchemyClientResult> }} Object containing the smart wallet client and account getter
 *
 * @example
 * ```tsx
 * const { getClient } = useAlchemyClient();
 * const { client, account } = await getClient();
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

  const getClient = useCallback(async (): Promise<AlchemyClientResult> => {
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
      accountAuthMode: config.accountAuthMode,
    });

    // Return cached client and account if configuration hasn't changed
    if (cache.client && cache.account && cache.cacheKey === currentCacheKey) {
      return { client: cache.client, account: cache.account };
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

    // Optionally extend signer with EIP-7702 authorization support
    const signer =
      config.accountAuthMode === "eip7702"
        ? {
            ...baseSigner,
            signAuthorization: async (
              unsignedAuth: AuthorizationRequest<number>,
            ): Promise<Authorization<number, true>> => {
              const signature = await signAuthorization({
                ...unsignedAuth,
                contractAddress:
                  unsignedAuth.address ?? unsignedAuth.contractAddress,
              });
              return { ...unsignedAuth, ...signature };
            },
          }
        : baseSigner;

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

    // Request the account to properly initialize the smart wallet
    // Pass a creation hint based on auth mode to ensure different accounts for different modes
    // This prevents 7702 accounts from being reused in owner mode and vice versa
    cache.account =
      config.accountAuthMode === "eip7702"
        ? await cache.client.requestAccount({
            creationHint: { accountType: "7702" },
          })
        : await cache.client.requestAccount({
            creationHint: { accountType: "sma-b" },
          });

    // Store the cache key
    cache.cacheKey = currentCacheKey;

    return { client: cache.client, account: cache.account };
  }, [
    getEmbeddedWallet,
    getEmbeddedWalletChain,
    signAuthorization,
    config.apiKey,
    config.jwt,
    config.rpcUrl,
    config.policyId,
    cache,
    config.accountAuthMode,
  ]);

  return { getClient };
}
