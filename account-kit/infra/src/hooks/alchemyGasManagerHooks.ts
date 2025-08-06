import type { Address, Client, Transport, Chain, Hex } from "viem";
import { hexToBigInt } from "viem";
import type {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
} from "viem/account-abstraction";
import { deepHexlify, resolveProperties } from "@aa-sdk/core";
import { alchemyEstimateFeesPerGas } from "../../../../packages/smart-accounts/src/alchemyEstimateFeesPerGas.js";
import type { PolicyToken } from "../middleware/gasManager.js";

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

        // If no cached result, we need to make the call
        // This shouldn't happen in normal operation as getPaymasterStubData is called first
        const stubResult = await this.getPaymasterStubData(parameters);

        if ("paymasterAndData" in stubResult && stubResult.paymasterAndData) {
          return { paymasterAndData: stubResult.paymasterAndData };
        }

        return {
          paymaster: stubResult.paymaster!,
          paymasterData: stubResult.paymasterData!,
          paymasterVerificationGasLimit:
            stubResult.paymasterVerificationGasLimit!,
          paymasterPostOpGasLimit: stubResult.paymasterPostOpGasLimit!,
        };
      },
    }),

    userOperation: {
      // Custom fee estimator that uses the cached gas values or Alchemy's fee estimation
      async estimateFeesPerGas(params: { bundlerClient: Client }) {
        // If we have cached gas values, return them
        if (cachedResult) {
          return {
            maxFeePerGas: hexToBigInt(cachedResult.maxFeePerGas),
            maxPriorityFeePerGas: hexToBigInt(
              cachedResult.maxPriorityFeePerGas,
            ),
          };
        }

        // Otherwise use Alchemy's fee estimation which includes rundler_maxPriorityFeePerGas
        return alchemyEstimateFeesPerGas(params);
      },
    },
  } as const;
}

/**
 * @deprecated Use alchemyGasManagerHooks instead
 */
export const alchemyGasAndPaymasterAndDataHooks = alchemyGasManagerHooks;
