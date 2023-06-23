import {
  deepHexlify,
  resolveProperties,
  type ConnectedSmartAccountProvider,
  type PublicErc4337Client,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Hex, Transport } from "viem";

type ClientWithAlchemyMethods = PublicErc4337Client & {
  request: PublicErc4337Client["request"] &
    {
      request(args: {
        method: "alchemy_requestPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest;
          }
        ];
      }): Promise<{ paymasterAndData: Hex }>;
      request(args: {
        method: "alchemy_requestGasAndPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest;
            dummySignature: Hex;
          }
        ];
      }): Promise<{
        paymasterAndData: Hex;
        callGasLimit: Hex;
        verificationGasLimit: Hex;
        preVerificationGas: Hex;
        maxFeePerGas: Hex;
        maxPriorityFeePerGas: Hex;
      }>;
    }["request"];
};

export interface AlchemyGasManagerConfig {
  policyId: string;
  entryPoint: Address;
  provider: PublicErc4337Client;
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
      // no-op gas manager because the alchemy api will do it
      .withFeeDataGetter(async () => ({
        maxFeePerGas: 0n,
        maxPriorityFeePerGas: 0n,
      }))
      .withPaymasterMiddleware({
        paymasterDataMiddleware: async (struct) => {
          const result = await (
            config.provider as ClientWithAlchemyMethods
          ).request({
            method: "alchemy_requestGasAndPaymasterAndData",
            params: [
              {
                policyId: config.policyId,
                entryPoint: config.entryPoint,
                userOperation: deepHexlify(await resolveProperties(struct)),
                dummySignature: provider.account.getDummySignature(),
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
 * {@link withAlchemyGasManager} instead which handles estimating gas + getting paymaster data in one go.
 *
 * @param config {@link AlchemyPaymasterConfig}
 * @returns middleware overrides for paymaster middlewares
 */
export const alchemyPaymasterAndDataMiddleware = (
  config: AlchemyGasManagerConfig
): Parameters<
  ConnectedSmartAccountProvider["withPaymasterMiddleware"]
>["0"] => ({
  dummyPaymasterDataMiddleware: async (_struct) => {
    switch (config.provider.chain.id) {
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
      config.provider as ClientWithAlchemyMethods
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
