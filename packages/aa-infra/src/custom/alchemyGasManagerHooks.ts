import { type Address, type Client, type Transport, type Chain } from "viem";
import type {
  BundlerClientConfig,
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
  PaymasterActions,
  SmartAccount,
} from "viem/account-abstraction";
import type { RequestGasAndPaymasterAndDataResponse } from "../actions/types.js";
import { requestGasAndPaymasterAndData } from "../actions/requestGasAndPaymasterAndData.js";

import { alchemyEstimateFeesPerGas } from "./alchemyEstimateFeesPerGas.js";

// Note: PolicyToken type is now integrated into AlchemyGasManagerConfig

// Simple cache for storing the latest user operation result
// Since viem calls hooks sequentially for a single user operation,
// we only need to store one result at a time
type UserOpRequestKey = string;

class UserOpCache {
  private cachedResult: RequestGasAndPaymasterAndDataResponse | null = null;
  private cachedUserOpRequestKey: UserOpRequestKey | null = null;

  get(
    userOpRequestKey: UserOpRequestKey,
  ): RequestGasAndPaymasterAndDataResponse | null {
    if (this.cachedUserOpRequestKey === userOpRequestKey) {
      return this.cachedResult;
    }
    return null;
  }

  set(
    userOpRequestKey: UserOpRequestKey,
    result: RequestGasAndPaymasterAndDataResponse,
  ): void {
    this.cachedResult = result;
    this.cachedUserOpRequestKey = userOpRequestKey;
  }

  getCurrent(): RequestGasAndPaymasterAndDataResponse | null {
    return this.cachedResult;
  }

  clear(): void {
    this.cachedResult = null;
    this.cachedUserOpRequestKey = null;
  }
}

// Create a cache key for the user operation parameters
function createUserOpCacheKey(
  params: GetPaymasterStubDataParameters | GetPaymasterDataParameters,
): UserOpRequestKey {
  return JSON.stringify({
    sender: params.sender,
    nonce: params.nonce?.toString(), // Convert bigint to string for stable serialization
    callData: params.callData,
  });
}

export type AlchemyGasManagerHooks = {
  paymaster: {
    getPaymasterStubData: PaymasterActions["getPaymasterStubData"];
    getPaymasterData: PaymasterActions["getPaymasterData"];
  };
  userOperation: {
    estimateFeesPerGas: NonNullable<
      NonNullable<
        BundlerClientConfig<Transport, Chain, SmartAccount>["userOperation"]
      >["estimateFeesPerGas"]
    >;
  };
};

export type AlchemyGasManagerConfig = {
  client: Client;
  address?: Address;
  maxTokenAmount?: bigint;
};

/**
 * Creates hooks for integrating Alchemy's Gas Manager with viem's bundler client.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {AlchemyGasManagerConfig} config - Configuration including client and optional ERC-20 token settings
 * @returns {AlchemyGasManagerHooks} Hooks for createBundlerClient
 *
 * @example
 * Basic usage:
 * ```ts
 * import { createClient, http, custom } from "viem";
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyGasManagerHooks } from "@alchemy/aa-infra";
 * import { sepolia } from "viem/chains";
 *
 * const client = createClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 * });
 *
 * const bundler = createBundlerClient({
 *   chain: sepolia,
 *   transport: custom(client),
 *   account, // Your smart account
 *   ...alchemyGasManagerHooks("your-policy-id", { client }),
 * });
 * ```
 *
 * @example
 * With ERC-20 token payment:
 * ```ts
 * const bundler = createBundlerClient({
 *   chain: sepolia,
 *   transport: custom(client),
 *   account,
 *   ...alchemyGasManagerHooks("your-policy-id", {
 *     client,
 *     address: "0xUSDC_ADDRESS", // ERC-20 token address
 *     maxTokenAmount: 10_000_000n // Max tokens to spend
 *   }),
 * });
 * ```
 */
export function alchemyGasManagerHooks(
  policyId: string | string[],
  config: AlchemyGasManagerConfig,
): AlchemyGasManagerHooks {
  const { client, address, maxTokenAmount } = config;

  // Helper to create gas manager context
  const createContext = () => {
    const context: any = {};

    context.policyId = policyId;

    // Add ERC-20 context if token address is provided
    if (address) {
      context.erc20Context = {
        tokenAddress: address,
        maxTokenAmount: maxTokenAmount
          ? toHex(maxTokenAmount)
          : undefined,
      };
    }

    return context;
  };

  // Create the hooks with client
  const createHooks = (client: Client): AlchemyGasManagerHooks => {
    const cache = new UserOpCache();

    // Helper function to fetch and cache paymaster data
    async function fetchAndCachePaymasterData(
      parameters: GetPaymasterDataParameters,
      cacheKey: string,
    ) {
      const { entryPointAddress, account, ...userOpFields } = parameters as any;

      // Get dummy signature from the account passed in parameters
      if (!account) {
        throw new Error(
          "No account found in parameters. Account must be provided to use gas manager hooks.",
        );
      }
      if (!account.getStubSignature) {
        throw new Error(
          "Account must have getStubSignature method to use gas manager hooks.",
        );
      }
      const dummySignature = await account.getStubSignature(userOpFields);

      const context = createContext();
      const request = {
        ...context,
        entryPoint: entryPointAddress,
        userOperation: userOpFields,
        dummySignature,
        overrides: {},
      };

      // Use the requestGasAndPaymasterAndData action
      const response = await requestGasAndPaymasterAndData(client as any, [
        request,
      ]);

      // Cache the result
      cache.set(cacheKey, response);

      return response;
    }

    return {
      paymaster: {
        async getPaymasterStubData(
          parameters: GetPaymasterStubDataParameters,
        ): Promise<GetPaymasterStubDataReturnType> {
          const userOpCacheKey = createUserOpCacheKey(parameters);

          // Reuse the existing helper function
          const response = await fetchAndCachePaymasterData(
            parameters,
            userOpCacheKey,
          );

          // Return stub data - Alchemy Gas Manager provides complete data, so isFinal is true for both EP versions
          if ("paymasterAndData" in response) {
            // For EP v0.6
            return {
              paymasterAndData: response.paymasterAndData,
              isFinal: true,
            };
          } else {
            // For EP v0.7
            return {
              paymaster: response.paymaster,
              paymasterData: response.paymasterData || "0x",
              paymasterVerificationGasLimit:
                response.paymasterVerificationGasLimit,
              paymasterPostOpGasLimit: response.paymasterPostOpGasLimit,
              isFinal: true, // Alchemy Gas Manager provides complete data
            };
          }
        },

        async getPaymasterData(
          parameters: GetPaymasterDataParameters,
        ): Promise<GetPaymasterDataReturnType> {
          const userOpCacheKey = createUserOpCacheKey(parameters);

          // Check if we have a cached result
          let response = cache.get(userOpCacheKey);

          if (!response) {
            // No cached result, fetch and cache the paymaster data
            response = await fetchAndCachePaymasterData(
              parameters,
              userOpCacheKey,
            );
          }

          // Convert response to data return type
          if ("paymasterAndData" in response) {
            // For EP v0.6
            return { paymasterAndData: response.paymasterAndData };
          } else {
            // For EP v0.7
            return {
              paymaster: response.paymaster,
              paymasterData: response.paymasterData,
              paymasterVerificationGasLimit:
                response.paymasterVerificationGasLimit,
              paymasterPostOpGasLimit: response.paymasterPostOpGasLimit,
            };
          }
        },
      },

      userOperation: {
        // Custom fee estimator that uses the cached gas values or Alchemy's fee estimation
        async estimateFeesPerGas(params: { bundlerClient: Client }) {
          // Check if we have cached gas values from the RPC response
          const cachedResult = cache.getCurrent();
          if (
            cachedResult?.maxFeePerGas &&
            cachedResult?.maxPriorityFeePerGas
          ) {
            // Use cached values and clear the cache after
            const gasEstimates = {
              maxFeePerGas: cachedResult.maxFeePerGas,
              maxPriorityFeePerGas: cachedResult.maxPriorityFeePerGas,
            };

            // Clear cache now that we've used all the data
            cache.clear();

            return gasEstimates;
          }

          // Otherwise use Alchemy's fee estimation
          return alchemyEstimateFeesPerGas({
            bundlerClient: params.bundlerClient,
          });
        },
      },
    };
  };

  // Client is required for gas manager hooks to work
  return createHooks(client);
}
