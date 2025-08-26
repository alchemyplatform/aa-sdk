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
 * You must use the `.bind(client)` method to create hooks that can make RPC calls.
 * The bound hooks will call `alchemy_requestGasAndPaymasterAndData` to get paymaster data.
 *
 * In test environments with custom transports, the transport layer intercepts these RPC calls
 * and provides the appropriate paymaster data.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration for paying gas with tokens
 * @returns {AlchemyGasManagerHooksWithBind} Hooks with bind method
 *
 * @example
 * ```ts
 * import { createBundlerClient, createClient, http } from "viem";
 * import { alchemyGasManagerHooks } from "@account-kit/infra";
 *
 * // Create a client with appropriate transport
 * const client = createClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   account, // Your smart account
 * });
 *
 * // Create and bind gas manager hooks
 * const gasManagerHooks = alchemyGasManagerHooks("your-policy-id");
 * const boundHooks = gasManagerHooks.bind(client);
 *
 * // Create bundler client with bound hooks
 * const bundler = createBundlerClient({
 *   chain: sepolia,
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   account,
 *   ...boundHooks,
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
          if (!client) {
            throw new Error(
              "Gas manager hooks must be bound to a client. Use .bind(client) before spreading the hooks.",
            );
          }

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
              isFinal: false,
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
          if (!client) {
            throw new Error(
              "Gas manager hooks must be bound to a client. Use .bind(client) before spreading the hooks.",
            );
          }

          const userOpCacheKey = createUserOpCacheKey(parameters);

          // Check if we have a cached result
          let response = cache.get(userOpCacheKey);

          if (!response) {
            // No cached result, make the RPC call
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
            response = await requestGasAndPaymasterAndData(client as any, [
              request,
            ]);

            // Cache the result
            cache.set(userOpCacheKey, response);
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

  // Create the default hooks (for test environments)
  const defaultHooks = createHooks();

  // Add the bind method
  return {
    ...defaultHooks,
    bind: (client: Client<Transport, Chain, SmartAccount>) =>
      createHooks(client),
  };
}
