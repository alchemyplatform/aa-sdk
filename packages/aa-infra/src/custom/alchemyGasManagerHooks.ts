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

import {
  alchemyEstimateFeesPerGas,
  type PriorityFeeClient,
} from "./alchemyEstimateFeesPerGas.js";

// Type for ERC-20 token context
export type PolicyToken = {
  address: Address;
  maxTokenAmount?: bigint;
};

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
      NonNullable<BundlerClientConfig["userOperation"]>["estimateFeesPerGas"]
    >;
  };
};

export type AlchemyGasManagerConfig = {
  client?: Client<Transport, Chain, SmartAccount>;
};

/**
 * Creates hooks for integrating Alchemy's Gas Manager with viem's bundler client.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken | AlchemyGasManagerConfig} [configOrToken] - Optional configuration or ERC-20 token configuration
 * @returns {AlchemyGasManagerHooks} Hooks for createBundlerClient
 *
 * @example
 * ```ts
 * import { createBundlerClient, createClient, http } from "viem";
 * import { alchemyGasManagerHooks } from "@account-kit/infra";
 *
 * const client = createClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   account, // Your smart account
 * });
 *
 * const bundler = createBundlerClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   account,
 *   ...alchemyGasManagerHooks("your-policy-id", { client }),
 * });
 * ```
 */
export function alchemyGasManagerHooks(
  policyId: string | string[],
  configOrToken?: PolicyToken | AlchemyGasManagerConfig,
): AlchemyGasManagerHooks {
  // Parse config/token parameter
  let policyToken: PolicyToken | undefined;
  let initialClient: Client<Transport, Chain, SmartAccount> | undefined;

  if (configOrToken) {
    // Check if it's a config object with client property
    if ("client" in configOrToken) {
      const config = configOrToken as AlchemyGasManagerConfig;
      initialClient = config.client;
    } else {
      // It's a PolicyToken (has address property)
      policyToken = configOrToken as PolicyToken;
    }
  }

  // Helper to create gas manager context
  const createContext = () => {
    const context: any = {};

    if (policyId) {
      context.policyId = Array.isArray(policyId) ? policyId[0] : policyId;
    }

    if (policyToken) {
      context.erc20Address = policyToken.address;
      if (policyToken.maxTokenAmount) {
        context.erc20MaxCost = `0x${policyToken.maxTokenAmount.toString(16)}`;
      }
    }

    return context;
  };

  // Create the hooks with client
  const createHooks = (
    client: Client<Transport, Chain, SmartAccount>,
  ): AlchemyGasManagerHooks => {
    const cache = new UserOpCache();

    return {
      paymaster: {
        async getPaymasterStubData(
          parameters: GetPaymasterStubDataParameters,
        ): Promise<GetPaymasterStubDataReturnType> {
          // For test environments, we need to make the RPC call here
          // The test transport will intercept and return the correct paymaster
          const userOpCacheKey = createUserOpCacheKey(parameters);
          const { entryPointAddress, ...userOpFields } = parameters;

          // Get dummy signature from the account
          if (!client.account) {
            throw new Error(
              "No account found on client. Client must have an account to use gas manager hooks.",
            );
          }
          const dummySignature =
            await client.account.getStubSignature(userOpFields);

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
          cache.set(userOpCacheKey, response);

          // Return stub data (not final)
          if ("paymasterAndData" in response) {
            return {
              paymasterAndData: response.paymasterAndData,
              isFinal: true,
            };
          } else {
            return {
              paymaster: response.paymaster,
              paymasterData: response.paymasterData || "0x",
              paymasterVerificationGasLimit:
                response.paymasterVerificationGasLimit,
              paymasterPostOpGasLimit: response.paymasterPostOpGasLimit,
              isFinal: false,
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
            response = await fetchAndCachePaymasterData(parameters, client, userOpCacheKey);
          }

// ... elsewhere in the file, add this shared function:

async function fetchAndCachePaymasterData(
  parameters: PaymasterAndDataParameters,
  client: Client,
  cacheKey: string,
) {
  const { entryPointAddress, ...userOpFields } = parameters;

  // Get dummy signature from the account
  if (!client.account) {
    throw new Error(
      "No account found on client. Client must have an account to use gas manager hooks.",
    );
  }
  const dummySignature =
    await client.account.getStubSignature(userOpFields);

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
        async estimateFeesPerGas(params: { bundlerClient: PriorityFeeClient }) {
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
  if (!initialClient) {
    throw new Error(
      "Gas manager hooks require a client. Pass it via config: alchemyGasManagerHooks(policyId, { client })",
    );
  }

  return createHooks(initialClient);
}
