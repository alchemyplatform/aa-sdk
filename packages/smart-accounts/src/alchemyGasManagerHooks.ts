import type { Address, Client, Transport, Chain, Hex } from "viem";
import type {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
  SmartAccount,
} from "viem/account-abstraction";
import { deepHexlify } from "@aa-sdk/core";
import { type AlchemyTransport } from "@alchemy/common";
import { requestGasAndPaymasterAndData } from "@alchemy/wallet-apis";
import {
  alchemyEstimateFeesPerGas,
  type PriorityFeeClient,
} from "./alchemyEstimateFeesPerGas.js";
// Constants
const DEFAULT_DUMMY_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c" as Hex;

// Type for ERC-20 token context
export type PolicyToken = {
  address: Address;
  maxTokenAmount?: bigint;
  permit?: {
    deadline: bigint;
    nonce: bigint;
    domain?: any;
  };
};

// Response is provided by wallet-apis (already bigint-formatted)
type GasAndPaymasterAndDataResponse = {
  callGasLimit?: bigint;
  preVerificationGas?: bigint;
  verificationGasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
} & (
  | { paymasterAndData: Hex }
  | {
      paymaster: Address;
      paymasterData: Hex;
      paymasterVerificationGasLimit: bigint;
      paymasterPostOpGasLimit: bigint;
    }
);

// Type guards
function hasPaymasterAndData(
  response: GasAndPaymasterAndDataResponse,
): response is GasAndPaymasterAndDataResponse & { paymasterAndData: Hex } {
  return "paymasterAndData" in response && Boolean(response.paymasterAndData);
}

function hasPaymasterFields(
  response: GasAndPaymasterAndDataResponse,
): response is GasAndPaymasterAndDataResponse & {
  paymaster: Address;
  paymasterData: Hex;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
} {
  return "paymaster" in response && Boolean(response.paymaster);
}

// Simple cache for the single user operation flow
class UserOpCache {
  private cache: Map<string, GasAndPaymasterAndDataResponse> = new Map();
  private lastResult: GasAndPaymasterAndDataResponse | null = null;

  get(userOpHash: string): GasAndPaymasterAndDataResponse | null {
    return this.cache.get(userOpHash) || null;
  }

  set(userOpHash: string, result: GasAndPaymasterAndDataResponse): void {
    this.cache.set(userOpHash, result);
    this.lastResult = result;
  }

  getLastResult(): GasAndPaymasterAndDataResponse | null {
    return this.lastResult;
  }

  delete(userOpHash: string): void {
    this.cache.delete(userOpHash);
    // Keep lastResult for estimateFeesPerGas
  }

  // not used right now
  clear(): void {
    this.cache.clear();
    this.lastResult = null;
  }
}

// Create a hash of the user operation for cache key
function getUserOpHash(
  params: GetPaymasterStubDataParameters | GetPaymasterDataParameters,
): string {
  return JSON.stringify({
    sender: params.sender,
    nonce: params.nonce?.toString(), // Convert bigint to string for stable serialization
    callData: params.callData,
  });
}

// Build the wallet-apis request
async function buildWalletApisRequest(
  parameters: GetPaymasterStubDataParameters | GetPaymasterDataParameters,
  bundlerClient: Client<Transport, Chain, SmartAccount>,
  context: AlchemyGasManagerContext,
): Promise<any> {
  const { entryPointAddress, ...userOpFields } = parameters;

  // Prepare user operation
  const userOp = deepHexlify(userOpFields);

  // Get dummy signature from the account if available, otherwise use default
  const dummySignature = bundlerClient.account?.getStubSignature
    ? await bundlerClient.account.getStubSignature(userOp)
    : DEFAULT_DUMMY_SIGNATURE;

  return {
    policyId: context.policyId,
    entryPoint: entryPointAddress,
    userOperation: userOp,
    dummySignature,
    overrides: {},
    ...(context.erc20Context ? { erc20Context: context.erc20Context } : {}),
  };
}

// Convert response to stub return type
function toStubReturn(
  response: GasAndPaymasterAndDataResponse,
): GetPaymasterStubDataReturnType {
  if (hasPaymasterAndData(response)) {
    return {
      paymasterAndData: response.paymasterAndData,
      isFinal: true,
    };
  }

  if (hasPaymasterFields(response)) {
    return {
      paymaster: response.paymaster,
      paymasterData: response.paymasterData || "0x",
      paymasterVerificationGasLimit:
        response.paymasterVerificationGasLimit ?? 100000n,
      paymasterPostOpGasLimit: response.paymasterPostOpGasLimit ?? 50000n,
      isFinal: true,
    };
  }

  throw new Error("No paymaster data returned from optimized call");
}

// Convert response to data return type
function toDataReturn(
  response: GasAndPaymasterAndDataResponse,
): GetPaymasterDataReturnType {
  if (hasPaymasterAndData(response)) {
    return { paymasterAndData: response.paymasterAndData };
  }

  if (hasPaymasterFields(response)) {
    return {
      paymaster: response.paymaster,
      paymasterData: response.paymasterData || "0x",
      paymasterVerificationGasLimit:
        response.paymasterVerificationGasLimit ?? 100000n,
      paymasterPostOpGasLimit: response.paymasterPostOpGasLimit ?? 50000n,
    };
  }

  throw new Error("No paymaster data returned from optimized call");
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

    if (policyToken.permit !== undefined) {
      console.warn(
        "⚠️ ERC-20 permits are not supported in viem-native gas manager hooks. " +
          "Use alchemyGasManagerMiddleware() for permit support.",
      );
    }
  }

  return context;
}

/**
 * Adapts Alchemy's Gas Manager to viem's paymaster interface using the optimized
 * `alchemy_requestGasAndPaymasterAndData` flow that combines gas estimation and
 * paymaster sponsorship in a single RPC call.
 *
 * This implementation caches the result from the first call to avoid duplicate RPC calls
 * when viem calls both getPaymasterStubData and getPaymasterData.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration (permits not supported)
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
    paymaster: (bundlerClient: Client<Transport, Chain, SmartAccount>) => ({
      async getPaymasterStubData(
        parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        const userOpHash = getUserOpHash(parameters);

        // Always make the RPC call (no cache check here)
        const request = await buildWalletApisRequest(
          parameters,
          bundlerClient,
          context,
        );
        const response = await requestGasAndPaymasterAndData(
          bundlerClient as Client<AlchemyTransport, Chain>,
          [request],
        );

        // Cache the result for getPaymasterData
        cache.set(userOpHash, response);

        return toStubReturn(response);
      },

      async getPaymasterData(
        parameters: GetPaymasterDataParameters,
      ): Promise<GetPaymasterDataReturnType> {
        const userOpHash = getUserOpHash(parameters);

        // Always get from cache - should be populated by getPaymasterStubData
        const cachedResult = cache.get(userOpHash);
        if (!cachedResult) {
          throw new Error(
            "No cached result found. getPaymasterStubData must be called before getPaymasterData.",
          );
        }

        // Delete this specific entry to prevent memory leaks
        // But keep lastResult for estimateFeesPerGas
        cache.delete(userOpHash);

        return toDataReturn(cachedResult);
      },
    }),

    userOperation: {
      // Custom fee estimator that uses the cached gas values or Alchemy's fee estimation
      async estimateFeesPerGas(params: { bundlerClient: PriorityFeeClient }) {
        // If we have gas values from the last cached result, use them
        const lastResult = cache.getLastResult();
        if (lastResult?.maxFeePerGas && lastResult?.maxPriorityFeePerGas) {
          return {
            maxFeePerGas: lastResult.maxFeePerGas,
            maxPriorityFeePerGas: lastResult.maxPriorityFeePerGas,
          };
        }

        // Otherwise use Alchemy's fee estimation
        return alchemyEstimateFeesPerGas({
          bundlerClient: params.bundlerClient,
        });
      },
    },
  } as const;
}
