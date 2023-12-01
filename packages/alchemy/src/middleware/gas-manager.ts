import {
  deepHexlify,
  filterUndefined,
  isBigNumberish,
  isPercentage,
  resolveProperties,
  type AccountMiddlewareFn,
  type Hex,
  type Percentage,
  type UserOperationFeeOptions,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import { fromHex } from "viem";
import type { AlchemyProvider } from "../provider/base.js";
import type { ClientWithAlchemyMethods } from "./client.js";
import type { RequestGasAndPaymasterAndDataOverrides } from "./types/index.js";

export interface AlchemyGasManagerConfig {
  policyId: string;
}

export interface AlchemyGasEstimationOptions {
  estimateGas: boolean;
  fallbackGasEstimator?: AccountMiddlewareFn;
  fallbackFeeDataGetter?: AccountMiddlewareFn;
}

/**
 * This middleware wraps the Alchemy Gas Manager APIs to provide more flexible UserOperation gas sponsorship.
 *
 * If `delegateGasEstimation` is true, it will use `alchemy_requestGasAndPaymasterAndData` to get all of the gas estimates + paymaster data
 * in one RPC call.
 *
 * Otherwise, it will use `alchemy_requestPaymasterAndData` to get only paymaster data, allowing you
 * to customize the gas and fee estimation middleware.
 *
 * @param provider - the smart account provider to override to use the alchemy gas manager
 * @param config - the alchemy gas manager configuration
 * @param delegateGasEstimation - if true, this will use `alchemy_requestGasAndPaymasterAndData` else will use `alchemy_requestPaymasterAndData`
 * @returns the provider augmented to use the alchemy gas manager
 */
export const withAlchemyGasManager = <P extends AlchemyProvider>(
  provider: P,
  config: AlchemyGasManagerConfig,
  gasEstimationOptions: AlchemyGasEstimationOptions = { estimateGas: true }
): P => {
  const fallbackGasEstimator =
    gasEstimationOptions.fallbackGasEstimator ?? provider.gasEstimator;
  const fallbackFeeDataGetter =
    gasEstimationOptions.fallbackFeeDataGetter ?? provider.feeDataGetter;

  return gasEstimationOptions.estimateGas
    ? provider
        // no-op gas estimator
        .withGasEstimator(async (struct, overrides, feeOptions) => {
          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides?.paymasterAndData === "0x") {
            const result = await fallbackGasEstimator(
              struct,
              overrides,
              feeOptions
            );
            return {
              callGasLimit: (await result.callGasLimit) ?? 0n,
              preVerificationGas: (await result.preVerificationGas) ?? 0n,
              verificationGasLimit: (await result.verificationGasLimit) ?? 0n,
            };
          } else {
            return {
              callGasLimit: 0n,
              preVerificationGas: 0n,
              verificationGasLimit: 0n,
            };
          }
        })
        // no-op fee because the alchemy api will do it
        .withFeeDataGetter(async (struct, overrides, feeOptions) => {
          let maxFeePerGas = (await struct.maxFeePerGas) ?? 0n;
          let maxPriorityFeePerGas = (await struct.maxPriorityFeePerGas) ?? 0n;

          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides?.paymasterAndData === "0x") {
            const result = await fallbackFeeDataGetter(
              struct,
              overrides,
              feeOptions
            );
            maxFeePerGas = (await result.maxFeePerGas) ?? maxFeePerGas;
            maxPriorityFeePerGas =
              (await result.maxPriorityFeePerGas) ?? maxPriorityFeePerGas;
          }

          return {
            maxFeePerGas,
            maxPriorityFeePerGas,
          };
        })
        .withPaymasterMiddleware(
          withAlchemyGasAndPaymasterAndDataMiddleware(provider, config)
        )
    : provider.withPaymasterMiddleware(
        withAlchemyPaymasterAndDataMiddleware(provider, config)
      );
};

/**
 * This uses the alchemy RPC method: `alchemy_requestPaymasterAndData`, which does not estimate gas. It's recommended to use
 * this middleware if you want more customization over the gas and fee estimation middleware, including setting
 * non-default buffer values for the fee/gas estimation.
 *
 * @param config - the alchemy gas manager configuration
 * @returns middleware overrides for paymaster middlewares
 */
const withAlchemyPaymasterAndDataMiddleware = <P extends AlchemyProvider>(
  provider: P,
  config: AlchemyGasManagerConfig
): Parameters<P["withPaymasterMiddleware"]>["0"] => ({
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
          entryPoint: provider.getEntryPointAddress(),
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
const withAlchemyGasAndPaymasterAndDataMiddleware = <P extends AlchemyProvider>(
  provider: P,
  config: AlchemyGasManagerConfig
): Parameters<P["withPaymasterMiddleware"]>["0"] => ({
  paymasterDataMiddleware: async (struct, overrides, feeOptions) => {
    const userOperation: UserOperationRequest = deepHexlify(
      await resolveProperties(struct)
    );

    const overrideField = (
      field: keyof UserOperationFeeOptions
    ): Hex | Percentage | undefined => {
      if (overrides?.[field] != null) {
        // one-off absolute override
        if (isBigNumberish(overrides[field])) {
          return deepHexlify(overrides[field]);
        }
        // one-off percentage overrides
        else {
          return {
            percentage:
              100 + Number((overrides[field] as Percentage).percentage),
          };
        }
      }

      // provider level fee options with percentage
      if (isPercentage(feeOptions?.[field])) {
        return {
          percentage:
            100 + Number((feeOptions![field] as Percentage).percentage),
        };
      }

      if (fromHex(userOperation[field], "bigint") > 0n) {
        return userOperation[field];
      }

      return undefined;
    };

    const _overrides: RequestGasAndPaymasterAndDataOverrides = filterUndefined({
      maxFeePerGas: overrideField("maxFeePerGas"),
      maxPriorityFeePerGas: overrideField("maxPriorityFeePerGas"),
      callGasLimit: overrideField("callGasLimit"),
      verificationGasLimit: overrideField("verificationGasLimit"),
      preVerificationGas: overrideField("preVerificationGas"),
    });

    const result = await (
      provider.rpcClient as ClientWithAlchemyMethods
    ).request({
      method: "alchemy_requestGasAndPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: provider.getEntryPointAddress(),
          userOperation: userOperation,
          dummySignature: userOperation.signature,
          overrides:
            Object.keys(_overrides).length > 0 ? _overrides : undefined,
        },
      ],
    });

    return result;
  },
});
