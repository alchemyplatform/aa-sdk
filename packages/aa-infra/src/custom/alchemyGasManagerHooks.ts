import {
  type Address,
  type Client,
  type Transport,
  type Chain,
  type Hex,
} from "viem";
import type {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
  SmartAccount,
} from "viem/account-abstraction";
import { type AlchemyTransport } from "@alchemy/common";
import { requestGasAndPaymasterAndData } from "../actions/requestGasAndPaymasterAndData.js";
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

// Type guards
function hasPaymasterAndData(
  response: RequestGasAndPaymasterAndDataResponse,
): response is RequestGasAndPaymasterAndDataResponse & {
  paymasterAndData: Hex;
} {
  return "paymasterAndData" in response && Boolean(response.paymasterAndData);
}

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

// Convert response to stub return type
function toStubReturn(
  response: RequestGasAndPaymasterAndDataResponse,
): GetPaymasterStubDataReturnType {
  if (hasPaymasterAndData(response)) {
    return {
      paymasterAndData: response.paymasterAndData,
      isFinal: true,
    };
  } else {
    // Must be paymaster fields format
    return {
      paymaster: response.paymaster,
      paymasterData: response.paymasterData || "0x",
      paymasterVerificationGasLimit:
        response.paymasterVerificationGasLimit ?? 100000n,
      paymasterPostOpGasLimit: response.paymasterPostOpGasLimit ?? 50000n,
      isFinal: true,
    };
  }
}

/**
 * Context for Alchemy Gas Manager calls
 */
interface AlchemyGasManagerContext {
  policyId: string | string[];
  erc20Context?: {
    tokenAddress: Address;
    maxTokenAmount?: bigint;
  };
}

/**
 * Creates the context object for Alchemy Gas Manager calls
 *
 * @param {string | string[]} policyId - The policy ID(s) for gas sponsorship
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration
 * @returns {AlchemyGasManagerContext} The context object for Gas Manager calls
 */
function createGasManagerContext(
  policyId: string | string[],
  policyToken?: PolicyToken,
): AlchemyGasManagerContext {
  const context: AlchemyGasManagerContext = { policyId };

  if (policyToken !== undefined) {
    context.erc20Context = {
      tokenAddress: policyToken.address,
      maxTokenAmount: policyToken.maxTokenAmount,
    };
  }

  return context;
}

/**
 * Adapts Alchemy's Gas Manager to viem's paymaster interface using the optimized
 * `alchemy_requestGasAndPaymasterAndData` flow that combines gas estimation and
 * paymaster sponsorship in a single RPC call.
 *
 * This implementation caches the result from the first call to avoid duplicate RPC calls
 * when viem calls both estimateFeesPerGas and paymaster functions.
 *
 * Note: ERC-20 permits are not supported in these viem-native hooks. Permits require
 * building and signing the permit message before sending the user operation, which is
 * handled by middleware but not by these lower-level hooks. Use alchemyGasManagerMiddleware()
 * for permit support.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration for paying gas with tokens
 * @returns {{ paymaster: Function, userOperation: { estimateFeesPerGas: Function } }} Hooks for createBundlerClient
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyGasManagerHooks } from "@alchemy/smart-accounts";
 *
 * const bundler = createBundlerClient({
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   chain: sepolia,
 *   account,
 *   ...alchemyGasManagerHooks("your-policy-id"),
 * });
 * ```
 */
export function alchemyGasManagerHooks(
  policyId: string | string[],
  policyToken?: PolicyToken,
) {
  const context = createGasManagerContext(policyId, policyToken);
  const cache = new UserOpCache();

  return {
    paymaster: (client: Client<Transport, Chain, SmartAccount>) => ({
      async getPaymasterStubData(
        parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        const userOpCacheKey = createUserOpCacheKey(parameters);

        // Always make the RPC call (no cache check here)
        const { entryPointAddress, ...userOpFields } = parameters;

        // Get dummy signature from the account
        if (!client.account) {
          throw new Error(
            "No account found on client. Client must have an account to use gas manager hooks.",
          );
        }
        const dummySignature =
          await client.account.getStubSignature(userOpFields);

        const request = {
          policyId: context.policyId,
          entryPoint: entryPointAddress,
          userOperation: userOpFields,
          dummySignature,
          overrides: {},
          ...(context.erc20Context
            ? { erc20Context: context.erc20Context }
            : {}),
        };

        const response = await requestGasAndPaymasterAndData(
          client as Client<AlchemyTransport, Chain>,
          [request],
        );

        // Cache the result for getPaymasterData
        cache.set(userOpCacheKey, response);

        return toStubReturn(response);
      },

      async getPaymasterData(
        parameters: GetPaymasterDataParameters,
      ): Promise<GetPaymasterDataReturnType> {
        const userOpCacheKey = createUserOpCacheKey(parameters);

        // Always get from cache - should be populated by getPaymasterStubData
        const cachedResult = cache.get(userOpCacheKey);
        if (!cachedResult) {
          throw new Error(
            "No cached result found. getPaymasterStubData must be called before getPaymasterData.",
          );
        }

        // Don't delete yet - estimateFeesPerGas might need the gas values
        // Convert response to data return type
        if (hasPaymasterAndData(cachedResult)) {
          return { paymasterAndData: cachedResult.paymasterAndData };
        } else {
          // Must be paymaster fields format
          return {
            paymaster: cachedResult.paymaster,
            paymasterData: cachedResult.paymasterData || "0x",
            paymasterVerificationGasLimit:
              cachedResult.paymasterVerificationGasLimit ?? 100000n,
            paymasterPostOpGasLimit:
              cachedResult.paymasterPostOpGasLimit ?? 50000n,
          };
        }
      },
    }),

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
