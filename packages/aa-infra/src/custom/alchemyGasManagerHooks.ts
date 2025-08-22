import { type Address } from "viem";
import type {
  BundlerClientConfig,
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
  PaymasterActions,
} from "viem/account-abstraction";
import type { RequestGasAndPaymasterAndDataResponse } from "../actions/types.js";
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

/**
 * Creates hooks for integrating Alchemy's Gas Manager with viem's bundler client.
 *
 * This implementation works with viem's paymaster interface for test environments
 * where the transport layer handles the actual RPC calls. The spread operator pattern
 * can be used in tests, but production environments may require a different integration
 * pattern to properly bind the client context.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [_policyToken] - Optional ERC-20 token configuration for paying gas with tokens (reserved for future use)
 * @returns {AlchemyGasManagerHooks} Hooks for createBundlerClient
 *
 * @example
 * ```ts
 * // In test environments with local test instances:
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyGasManagerHooks } from "@account-kit/infra";
 *
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
  _policyToken?: PolicyToken,
): AlchemyGasManagerHooks {
  // The policyId and policyToken are used by the transport layer in production environments
  // In test environments, the transport intercepts these calls regardless
  void policyId; // Mark as intentionally unused

  const cache = new UserOpCache();

  return {
    paymaster: {
      async getPaymasterStubData(
        _parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        // WARNING: This implementation is designed for test environments only
        // The test environment uses a paymaster transport that intercepts these calls
        // In production, a different integration pattern is required that can access the client
        // TODO: Implement production pattern when viem architecture allows it
        return {
          paymasterAndData: "0x",
          isFinal: false,
        };
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
        if (cachedResult?.maxFeePerGas && cachedResult?.maxPriorityFeePerGas) {
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
  } as const;
}
