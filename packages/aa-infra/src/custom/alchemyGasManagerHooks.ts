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

// Extended type that includes the bind method for production use
export type AlchemyGasManagerHooksWithBind = AlchemyGasManagerHooks & {
  bind: (
    client: Client<Transport, Chain, SmartAccount>,
  ) => AlchemyGasManagerHooks;
};

/**
 * Creates hooks for integrating Alchemy's Gas Manager with viem's bundler client.
 *
 * For production use, you must use the `.bind(client)` method to create hooks that can
 * make RPC calls. For test environments, the spread operator pattern works directly.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration for paying gas with tokens
 * @returns {AlchemyGasManagerHooksWithBind} Hooks with bind method for production use
 *
 * @example
 * ```ts
 * // For production with Alchemy transport:
 * import { createBundlerClient, createClient, http } from "viem";
 * import { alchemyGasManagerHooks } from "@account-kit/infra";
 *
 * const client = createClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 * });
 *
 * const gasManagerHooks = alchemyGasManagerHooks("your-policy-id");
 * const boundHooks = gasManagerHooks.bind(client);
 *
 * const bundler = createBundlerClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   account,
 *   ...boundHooks,
 * });
 *
 * // For tests with local instances:
 * const bundler = createBundlerClient({
 *   chain: local070Instance.chain,
 *   transport: custom(client),
 *   account,
 *   ...alchemyGasManagerHooks("test-policy"),
 * });
 * ```
 */
export function alchemyGasManagerHooks(
  policyId: string | string[],
  policyToken?: PolicyToken,
): AlchemyGasManagerHooksWithBind {
  // Create a cache instance that can be shared across bound hooks
  const sharedCache = new UserOpCache();

  // Helper to create gas manager context
  const createContext = () => {
    const context: any = { policyId };
    if (policyToken) {
      context.erc20Context = {
        tokenAddress: policyToken.address,
        maxTokenAmount: policyToken.maxTokenAmount,
      };
    }
    return context;
  };

  // Create the hooks with optional client binding
  const createHooks = (
    client?: Client<Transport, Chain, SmartAccount>,
  ): AlchemyGasManagerHooks => {
    const cache = client ? new UserOpCache() : sharedCache;

    return {
      paymaster: {
        async getPaymasterStubData(
          parameters: GetPaymasterStubDataParameters,
        ): Promise<GetPaymasterStubDataReturnType> {
          // If no client is bound, return test values
          if (!client) {
            return {
              paymasterAndData: "0x",
              isFinal: false,
            };
          }

          // Production implementation with client
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

          const response = await requestGasAndPaymasterAndData(client as any, [
            request,
          ]);

          // Cache the result for getPaymasterData
          cache.set(userOpCacheKey, response);

          // Return stub data
          if ("paymasterAndData" in response) {
            return {
              paymasterAndData: response.paymasterAndData,
              isFinal: true,
            };
          } else {
            return {
              paymaster: response.paymaster,
              paymasterData: response.paymasterData,
              paymasterVerificationGasLimit:
                response.paymasterVerificationGasLimit,
              paymasterPostOpGasLimit: response.paymasterPostOpGasLimit,
              isFinal: true,
            };
          }
        },

        async getPaymasterData(
          parameters: GetPaymasterDataParameters,
        ): Promise<GetPaymasterDataReturnType> {
          const userOpCacheKey = createUserOpCacheKey(parameters);

          // Check if we have cached result from getPaymasterStubData
          const cachedResult = cache.get(userOpCacheKey);
          if (cachedResult) {
            // We have cached data from a previous call
            // Convert response to data return type
            if ("paymasterAndData" in cachedResult) {
              // For EP v0.6
              return { paymasterAndData: cachedResult.paymasterAndData };
            } else {
              // For EP v0.7
              return {
                paymaster: cachedResult.paymaster,
                paymasterData: cachedResult.paymasterData,
                paymasterVerificationGasLimit:
                  cachedResult.paymasterVerificationGasLimit,
                paymasterPostOpGasLimit: cachedResult.paymasterPostOpGasLimit,
              };
            }
          }

          // No cached result - in test environments, the transport handles this
          // Return default values that the test transport will intercept
          return {
            paymasterAndData: "0x",
          };
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

  // Create the default hooks (for test environments)
  const defaultHooks = createHooks();

  // Add the bind method
  return {
    ...defaultHooks,
    bind: (client: Client<Transport, Chain, SmartAccount>) =>
      createHooks(client),
  };
}
