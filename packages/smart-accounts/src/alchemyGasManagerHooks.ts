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
// Note: types are not exported from wallet-apis index; use structural typing locally instead
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

  // Cache to store the result between calls
  let cachedResult: GasAndPaymasterAndDataResponse | null = null;
  let cachedUserOpHash: string | null = null;

  // Helper to create a hash of the user operation for cache key
  const getUserOpHash = (params: any): string => {
    return JSON.stringify({
      sender: params.sender,
      nonce: params.nonce?.toString(), // Convert bigint to string
      callData: params.callData,
      // Include other relevant fields that affect the result
    });
  };

  return {
    paymaster: (bundlerClient: Client<Transport, Chain, SmartAccount>) => ({
      async getPaymasterStubData(
        parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        const userOpHash = getUserOpHash(parameters);

        // If we have a cached result for this user op, return it
        if (cachedResult && cachedUserOpHash === userOpHash) {
          if (
            "paymasterAndData" in (cachedResult as any) &&
            (cachedResult as any).paymasterAndData
          ) {
            return {
              paymasterAndData: (cachedResult as any).paymasterAndData,
              isFinal: true, // We have final data from the optimized call
            };
          }

          if ((cachedResult as any).paymaster) {
            const r = cachedResult as any;
            return {
              paymaster: r.paymaster as Address,
              paymasterData: (r.paymasterData as Hex) || "0x",
              paymasterVerificationGasLimit:
                r.paymasterVerificationGasLimit ?? 100000n,
              paymasterPostOpGasLimit: r.paymasterPostOpGasLimit ?? 50000n,
              isFinal: true,
            };
          }
        }

        // Make the optimized RPC call
        const {
          chainId,
          entryPointAddress,
          context: userContext,
          ...userOpFields
        } = parameters;

        // Prepare user operation
        const userOp = deepHexlify(userOpFields);

        // Get dummy signature from the account if available, otherwise use default
        const dummySignature = bundlerClient.account?.getStubSignature
          ? await bundlerClient.account.getStubSignature(userOp as any)
          : ("0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c" as Hex);

        // Prepare the request
        const request = {
          policyId: context.policyId,
          entryPoint: entryPointAddress,
          userOperation: userOp,
          dummySignature,
          overrides: {},
          ...(context.erc20Context
            ? { erc20Context: context.erc20Context }
            : {}),
        };

        // Make the optimized RPC call using wallet-apis action
        const response = await requestGasAndPaymasterAndData(
          bundlerClient as unknown as Client<AlchemyTransport, Chain>,
          [request as any],
        );

        // Cache the result
        cachedResult = response;
        cachedUserOpHash = userOpHash;

        // Return paymaster data for stub
        if (
          "paymasterAndData" in response &&
          (response as any).paymasterAndData
        ) {
          return {
            paymasterAndData: (response as any).paymasterAndData,
            isFinal: true,
          };
        }

        if ((response as any).paymaster) {
          const r = response as any;
          return {
            paymaster: r.paymaster as Address,
            paymasterData: (r.paymasterData as Hex) || "0x",
            paymasterVerificationGasLimit:
              r.paymasterVerificationGasLimit ?? 100000n,
            paymasterPostOpGasLimit: r.paymasterPostOpGasLimit ?? 50000n,
            isFinal: true,
          };
        }

        throw new Error("No paymaster data returned from optimized call");
      },

      async getPaymasterData(
        parameters: GetPaymasterDataParameters,
      ): Promise<GetPaymasterDataReturnType> {
        const userOpHash = getUserOpHash(parameters);

        // If we have a cached result, use it
        if (cachedResult && cachedUserOpHash === userOpHash) {
          if (
            "paymasterAndData" in (cachedResult as any) &&
            (cachedResult as any).paymasterAndData
          ) {
            return { paymasterAndData: (cachedResult as any).paymasterAndData };
          }

          if ((cachedResult as any).paymaster) {
            const r = cachedResult as any;
            return {
              paymaster: r.paymaster as Address,
              paymasterData: (r.paymasterData as Hex) || "0x",
              paymasterVerificationGasLimit:
                r.paymasterVerificationGasLimit ?? 100000n,
              paymasterPostOpGasLimit: r.paymasterPostOpGasLimit ?? 50000n,
            };
          }
        }

        // If no cached result, we need to make the call
        // This shouldn't happen in normal operation as getPaymasterStubData is called first
        const stubResult = await this.getPaymasterStubData(parameters);

        if ("paymasterAndData" in stubResult && stubResult.paymasterAndData) {
          return { paymasterAndData: stubResult.paymasterAndData };
        }

        // Type narrowing ensures these fields exist after the check above
        return {
          paymaster: stubResult.paymaster,
          paymasterData: stubResult.paymasterData,
          paymasterVerificationGasLimit:
            stubResult.paymasterVerificationGasLimit,
          paymasterPostOpGasLimit: stubResult.paymasterPostOpGasLimit,
        };
      },
    }),

    userOperation: {
      // Custom fee estimator that uses the cached gas values or Alchemy's fee estimation
      async estimateFeesPerGas(params: { bundlerClient: PriorityFeeClient }) {
        // If we have cached gas values, return them
        if (cachedResult && (cachedResult as any).maxFeePerGas) {
          const r = cachedResult as {
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
          };
          return {
            maxFeePerGas: r.maxFeePerGas,
            maxPriorityFeePerGas: r.maxPriorityFeePerGas,
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
