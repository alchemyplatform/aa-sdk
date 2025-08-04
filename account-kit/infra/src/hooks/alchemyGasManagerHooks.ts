import type { Address, Client, Transport, Chain, Hex } from "viem";
import { toHex, hexToBigInt } from "viem";
import type {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
} from "viem/account-abstraction";
import { deepHexlify, resolveProperties } from "@aa-sdk/core";
import type { PolicyToken } from "../middleware/gasManager.js";

// Type for ERC-7677 paymaster response
type Erc7677PaymasterResponse = {
  paymasterAndData?: Hex;
  paymaster?: Address;
  paymasterData?: Hex;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
};

/**
 * Context for Alchemy Gas Manager ERC-7677 calls
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
 * @returns {AlchemyGasManagerContext} The context object for ERC-7677 calls
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
 * Adapts Alchemy's Gas Manager to viem's new paymaster interface.
 *
 * Creates viem-compatible paymaster hooks that work directly with Alchemy's
 * ERC-7677 implementation for gas sponsorship.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration (permits not supported)
 * @returns {{ paymaster: { getPaymasterData: Function, getPaymasterStubData: Function } }} Paymaster hooks for createBundlerClient
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyGasManagerHooks } from "@account-kit/infra";
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

  // We need to return a function that will be called by createBundlerClient
  // The function receives the bundlerClient and returns the paymaster hooks
  return {
    paymaster: (bundlerClient: Client<Transport, Chain>) => ({
      async getPaymasterData(
        parameters: GetPaymasterDataParameters,
      ): Promise<GetPaymasterDataReturnType> {
        const {
          chainId,
          entryPointAddress,
          context: userContext,
          ...userOpFields
        } = parameters;

        // Prepare user operation for ERC-7677 call
        const userOp = deepHexlify(
          await resolveProperties(userOpFields as any),
        );

        // Merge contexts
        const finalContext = {
          ...context,
          ...(userContext || {}),
        };

        // Make ERC-7677 pm_getPaymasterData call
        const response = await bundlerClient.request<{
          Method: "pm_getPaymasterData";
          Parameters: [any, Address, Hex, any];
          ReturnType: Erc7677PaymasterResponse;
        }>({
          method: "pm_getPaymasterData",
          params: [userOp, entryPointAddress, toHex(chainId), finalContext],
        });

        // Format response for viem
        if (response.paymasterAndData) {
          return { paymasterAndData: response.paymasterAndData };
        }

        if (response.paymaster) {
          return {
            paymaster: response.paymaster,
            paymasterData: response.paymasterData || "0x",
            paymasterVerificationGasLimit:
              response.paymasterVerificationGasLimit!,
            paymasterPostOpGasLimit: response.paymasterPostOpGasLimit!,
          };
        }

        throw new Error("No paymaster data returned from ERC-7677 call");
      },

      async getPaymasterStubData(
        parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        const {
          chainId,
          entryPointAddress,
          context: userContext,
          ...userOpFields
        } = parameters;

        // Prepare user operation with zero gas values for stub call
        const userOp = deepHexlify(
          await resolveProperties(userOpFields as any),
        );

        // For stub calls, set gas values to zero as per ERC-7677
        userOp.maxFeePerGas = "0x0";
        userOp.maxPriorityFeePerGas = "0x0";
        userOp.callGasLimit = "0x0";
        userOp.verificationGasLimit = "0x0";
        userOp.preVerificationGas = "0x0";

        // For EP v0.7, also zero out paymaster gas fields
        if (
          entryPointAddress
            .toLowerCase()
            .includes("0x0000000071727de22e5e9d8baf0edac6f37da032")
        ) {
          userOp.paymasterVerificationGasLimit = "0x0";
          userOp.paymasterPostOpGasLimit = "0x0";
        }

        // Merge contexts
        const finalContext = {
          ...context,
          ...(userContext || {}),
        };

        // Make ERC-7677 pm_getPaymasterStubData call
        const response = await bundlerClient.request<{
          Method: "pm_getPaymasterStubData";
          Parameters: [any, Address, Hex, any];
          ReturnType: Erc7677PaymasterResponse;
        }>({
          method: "pm_getPaymasterStubData",
          params: [userOp, entryPointAddress, toHex(chainId), finalContext],
        });

        // Format response for viem
        if (response.paymasterAndData) {
          return {
            paymasterAndData: response.paymasterAndData,
            isFinal: false,
          };
        }

        if (response.paymaster) {
          return {
            paymaster: response.paymaster,
            paymasterData: response.paymasterData || "0x",
            paymasterVerificationGasLimit:
              response.paymasterVerificationGasLimit!,
            paymasterPostOpGasLimit: response.paymasterPostOpGasLimit || 50000n,
            isFinal: false,
          };
        }

        throw new Error("No paymaster stub data returned from ERC-7677 call");
      },
    }),
  } as const;
}

// Type for the optimized RPC response
type GasAndPaymasterAndDataResponse = {
  callGasLimit: Hex;
  preVerificationGas: Hex;
  verificationGasLimit: Hex;
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
  paymasterAndData?: Hex;
  paymaster?: Address;
  paymasterData?: Hex;
  paymasterVerificationGasLimit?: Hex;
  paymasterPostOpGasLimit?: Hex;
};

/**
 * Adapts Alchemy's optimized gas+paymaster middleware to viem's new interface.
 * Uses the non-standard `alchemy_requestGasAndPaymasterAndData` flow that combines
 * gas estimation and paymaster sponsorship in a single RPC call.
 *
 * This implementation caches the result from the first call to avoid duplicate RPC calls
 * when viem calls both getPaymasterStubData and getPaymasterData.
 *
 * @param {string | string[]} policyId - The policy ID(s) for Alchemy's gas manager
 * @param {PolicyToken} [policyToken] - Optional ERC-20 token configuration
 * @returns {{ paymaster: Function, userOperation: { estimateFeesPerGas: Function } }} Hooks for createBundlerClient
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "viem/account-abstraction";
 * import { alchemyGasAndPaymasterAndDataHooks } from "@account-kit/infra";
 *
 * const bundler = createBundlerClient({
 *   transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
 *   chain: sepolia,
 *   account,
 *   ...alchemyGasAndPaymasterAndDataHooks("your-policy-id"),
 * });
 * ```
 */
export function alchemyGasAndPaymasterAndDataHooks(
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
    paymaster: (bundlerClient: Client<Transport, Chain>) => ({
      async getPaymasterStubData(
        parameters: GetPaymasterStubDataParameters,
      ): Promise<GetPaymasterStubDataReturnType> {
        const userOpHash = getUserOpHash(parameters);

        // If we have a cached result for this user op, return it
        if (cachedResult && cachedUserOpHash === userOpHash) {
          if (cachedResult.paymasterAndData) {
            return {
              paymasterAndData: cachedResult.paymasterAndData,
              isFinal: true, // We have final data from the optimized call
            };
          }

          if (cachedResult.paymaster) {
            return {
              paymaster: cachedResult.paymaster,
              paymasterData: cachedResult.paymasterData || "0x",
              paymasterVerificationGasLimit:
                cachedResult.paymasterVerificationGasLimit
                  ? hexToBigInt(cachedResult.paymasterVerificationGasLimit)
                  : 100000n,
              paymasterPostOpGasLimit: cachedResult.paymasterPostOpGasLimit
                ? hexToBigInt(cachedResult.paymasterPostOpGasLimit)
                : 50000n,
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
        const userOp = deepHexlify(
          await resolveProperties(userOpFields as any),
        );

        // We need the account to get dummy signature, but viem doesn't provide it
        // For now, we'll use a default dummy signature
        const dummySignature =
          "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

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

        // Make the optimized RPC call
        const response = await bundlerClient.request<{
          Method: "alchemy_requestGasAndPaymasterAndData";
          Parameters: [typeof request];
          ReturnType: GasAndPaymasterAndDataResponse;
        }>({
          method: "alchemy_requestGasAndPaymasterAndData",
          params: [request],
        });

        // Cache the result
        cachedResult = response;
        cachedUserOpHash = userOpHash;

        // Return paymaster data for stub
        if (response.paymasterAndData) {
          return {
            paymasterAndData: response.paymasterAndData,
            isFinal: true,
          };
        }

        if (response.paymaster) {
          return {
            paymaster: response.paymaster,
            paymasterData: response.paymasterData || "0x",
            paymasterVerificationGasLimit:
              response.paymasterVerificationGasLimit
                ? hexToBigInt(response.paymasterVerificationGasLimit)
                : 100000n,
            paymasterPostOpGasLimit: response.paymasterPostOpGasLimit
              ? hexToBigInt(response.paymasterPostOpGasLimit)
              : 50000n,
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
          if (cachedResult.paymasterAndData) {
            return { paymasterAndData: cachedResult.paymasterAndData };
          }

          if (cachedResult.paymaster) {
            return {
              paymaster: cachedResult.paymaster,
              paymasterData: cachedResult.paymasterData || "0x",
              paymasterVerificationGasLimit:
                cachedResult.paymasterVerificationGasLimit
                  ? hexToBigInt(cachedResult.paymasterVerificationGasLimit)
                  : 100000n,
              paymasterPostOpGasLimit: cachedResult.paymasterPostOpGasLimit
                ? hexToBigInt(cachedResult.paymasterPostOpGasLimit)
                : 50000n,
            };
          }
        }

        // If no cached result, fall back to regular flow
        // This shouldn't happen in normal operation
        return alchemyGasManagerHooks(policyId, policyToken)
          .paymaster(bundlerClient)
          .getPaymasterData(parameters);
      },
    }),

    userOperation: {
      // Custom fee estimator that uses the cached gas values
      async estimateFeesPerGas({ bundlerClient }: { bundlerClient: Client }) {
        // If we have cached gas values, return them
        if (cachedResult) {
          return {
            maxFeePerGas: hexToBigInt(cachedResult.maxFeePerGas),
            maxPriorityFeePerGas: hexToBigInt(
              cachedResult.maxPriorityFeePerGas,
            ),
          };
        }

        // Otherwise use default estimation
        const block = await bundlerClient.request({
          method: "eth_getBlockByNumber",
          params: ["latest", false],
        });
        const baseFeePerGas = block
          ? hexToBigInt(block.baseFeePerGas || "0x0")
          : 0n;
        const maxPriorityFeePerGas = hexToBigInt("0x5f5e100"); // 0.1 gwei default

        return {
          maxFeePerGas: baseFeePerGas * 2n + maxPriorityFeePerGas,
          maxPriorityFeePerGas,
        };
      },
    },
  } as const;
}
