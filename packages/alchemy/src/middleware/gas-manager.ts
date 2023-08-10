import {
  deepHexlify,
  resolveProperties,
  type ConnectedSmartAccountProvider,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Transport } from "viem";
import type { ClientWithAlchemyMethods } from "./client.js";

export interface AlchemyGasManagerConfig {
  policyId: string;
  entryPoint: Address;
}

/**
 * This uses the alchemy RPC method: `alchemy_requestGasAndPaymasterAndData` to get all of the gas estimates + paymaster data
 * in one RPC call. It will no-op the gas estimator and fee data getter middleware and set a custom middleware that makes the RPC call
 *
 * @param provider - the smart account provider to override to use the alchemy paymaster
 * @param config - the alchemy paymaster configuration
 * @returns the provider augmented to use the alchemy paymaster
 */
export const withAlchemyGasManager = <
  T extends Transport,
  Provider extends ConnectedSmartAccountProvider<T>
>(
  provider: Provider,
  config: AlchemyGasManagerConfig
): Provider => {
  return (
    provider
      // no-op gas estimator
      .withGasEstimator(async () => ({
        callGasLimit: 0n,
        preVerificationGas: 0n,
        verificationGasLimit: 0n,
      }))
      // no-op fee because the alchemy api will do it
      // can set this after the fact to do fee overrides.
      .withFeeDataGetter(async () => ({
        maxFeePerGas: 0n,
        maxPriorityFeePerGas: 0n,
      }))
      .withPaymasterMiddleware({
        paymasterDataMiddleware: async (struct) => {
          const userOperation: UserOperationRequest = deepHexlify(
            await resolveProperties(struct)
          );

          let feeOverride = undefined;
          if (BigInt(userOperation.maxFeePerGas) > 0n) {
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
                dummySignature: provider.account.getDummySignature(),
                feeOverride: feeOverride,
              },
            ],
          });

          return result;
        },
      })
  );
};

/**
 * This is the middleware for calling the alchemy paymaster API which does not estimate gas. It's recommend to use
 * this middleware if you want more customization over the gas and fee estimation middleware, including setting
 * non-default buffer values for the fee/gas estimation.
 *
 * @param config {@link AlchemyPaymasterConfig}
 * @returns middleware overrides for paymaster middlewares
 */
export const alchemyPaymasterAndDataMiddleware = <
  T extends Transport,
  Provider extends ConnectedSmartAccountProvider<T>
>(
  provider: Provider,
  config: AlchemyGasManagerConfig
): Parameters<
  ConnectedSmartAccountProvider["withPaymasterMiddleware"]
>["0"] => ({
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
