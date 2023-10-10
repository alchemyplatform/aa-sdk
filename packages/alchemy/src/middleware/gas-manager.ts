import {
  deepHexlify,
  resolveProperties,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address } from "viem";
import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export interface AlchemyGasManagerConfig {
  policyId: string;
  entryPoint: Address;
}

/**
 * This middleware wraps the Alchemy Gas Manager APIs to provide more flexible UserOperation gas sponsorship.
 *
 * If `estimateGas` is true, it will use `alchemy_requestGasAndPaymasterAndData` to get all of the gas estimates + paymaster data
 * in one RPC call.
 *
 * Otherwise, it will use `alchemy_requestPaymasterAndData` to get only paymaster data, allowing you
 * to customize the gas and fee estimation middleware.
 *
 * @param provider - the smart account provider to override to use the alchemy gas manager
 * @param config - the alchemy gas manager configuration
 * @param estimateGas - if true, this will use `alchemy_requestGasAndPaymasterAndData` else will use `alchemy_requestPaymasterAndData`
 * @returns the provider augmented to use the alchemy gas manager
 */
export const withAlchemyGasManager = (
  provider: AlchemyProvider,
  config: AlchemyGasManagerConfig,
  estimateGas: boolean = true
): AlchemyProvider => {
  return estimateGas
    ? provider
        // no-op gas estimator
        .withGasEstimator(async () => ({
          callGasLimit: 0n,
          preVerificationGas: 0n,
          verificationGasLimit: 0n,
        }))
        // no-op fee because the alchemy api will do it
        .withFeeDataGetter(async (struct) => ({
          maxFeePerGas: (await struct.maxFeePerGas) ?? 0n,
          maxPriorityFeePerGas: (await struct.maxPriorityFeePerGas) ?? 0n,
        }))
        .withPaymasterMiddleware(
          withAlchemyGasAndPaymasterAndDataMiddleware(provider, config)
        )
    : provider.withPaymasterMiddleware(
        withAlchemyPaymasterAndDataMiddleware(provider, config)
      );
};

/**
 * This uses the alchemy RPC method: `alchemy_requestPaymasterAndData`, which does not estimate gas. It's recommend to use
 * this middleware if you want more customization over the gas and fee estimation middleware, including setting
 * non-default buffer values for the fee/gas estimation.
 *
 * @param config - the alchemy gas manager configuration
 * @returns middleware overrides for paymaster middlewares
 */
const withAlchemyPaymasterAndDataMiddleware = (
  provider: AlchemyProvider,
  config: AlchemyGasManagerConfig
): Parameters<AlchemyProvider["withPaymasterMiddleware"]>["0"] => ({
  dummyPaymasterDataMiddleware: async (_struct) => {
    switch (provider.rpcClient.chain.id) {
      case 1:
      case 10:
      case 137:
      case 42161:
        return {
          paymasterAndData:
            "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        };
      default:
        return {
          paymasterAndData:
            "0xc03aac639bb21233e0139381970328db8bceeb67fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        };
    }
  },
  paymasterDataMiddleware: async (struct) => {
    const { paymasterAndData } = await (
      provider.rpcClient as ClientWithAlchemyMethods
    ).request({
      method: "alchemy_requestPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: config.entryPoint,
          userOperation: deepHexlify(await resolveProperties(struct)),
        },
      ],
    });
    return { paymasterAndData };
  },
});

/**
 * This uses the alchemy RPC method: `alchemy_requestGasAndPaymasterAndData` to get all of the gas estimates + paymaster data
 * in one RPC call. It will no-op the gas estimator and fee data getter middleware and set a custom middleware that makes the RPC call.
 *
 * @param config - the alchemy gas manager configuration
 * @returns middleware overrides for paymaster middlewares
 */
const withAlchemyGasAndPaymasterAndDataMiddleware = (
  provider: AlchemyProvider,
  config: AlchemyGasManagerConfig
): Parameters<AlchemyProvider["withPaymasterMiddleware"]>["0"] => ({
  paymasterDataMiddleware: async (struct) => {
    const userOperation: UserOperationRequest = deepHexlify(
      await resolveProperties(struct)
    );

    let feeOverride = undefined;
    if (userOperation.maxFeePerGas && BigInt(userOperation.maxFeePerGas) > 0n) {
      feeOverride = {
        maxFeePerGas: userOperation.maxFeePerGas,
        maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
      };
    }

    const result = await (
      provider.rpcClient as ClientWithAlchemyMethods
    ).request({
      method: "alchemy_requestGasAndPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: config.entryPoint,
          userOperation: userOperation,
          dummySignature: userOperation.signature,
          feeOverride: feeOverride,
        },
      ],
    });

    return result;
  },
});
