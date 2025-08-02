import type { Address, Client, Transport, Chain, Hex } from "viem";
import { toHex } from "viem";
import type {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
} from "viem/account-abstraction";
import { deepHexlify, resolveProperties } from "@aa-sdk/core";
import type { PolicyToken } from "../middleware/gasManager.js";
import type { AlchemyTransport } from "../alchemyTransport.js";

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

export interface AlchemyGasAndPaymasterHookParams {
  policyId: string | string[];
  policyToken?: PolicyToken;
  transport: AlchemyTransport;
  gasEstimatorOverride?: any;
  feeEstimatorOverride?: any;
}

/**
 * Adapts Alchemy's gas+paymaster middleware to viem's new interface.
 * Uses the non-standard `alchemy_requestGasAndPaymasterAndData` flow.
 *
 * @deprecated This function is complex and requires account interactions.
 * For most use cases, prefer `alchemyGasManagerHooks()` with standard ERC-7677 flow.
 * For the full gas+paymaster flow, continue using the middleware approach with createSmartAccountClient.
 *
 * @param {AlchemyGasAndPaymasterHookParams} _params - Configuration parameters
 * @returns {never} This function is not implemented
 */
export function alchemyGasAndPaymasterAndDataHooks(
  _params: AlchemyGasAndPaymasterHookParams,
): never {
  throw new Error(
    "alchemyGasAndPaymasterAndDataHooks is not implemented for viem interface. " +
      "Use alchemyGasManagerHooks() for standard ERC-7677 flow, or use the middleware approach with createSmartAccountClient.",
  );
}
