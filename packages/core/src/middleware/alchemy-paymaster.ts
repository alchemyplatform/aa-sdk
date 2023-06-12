import type { Address, Hex, Transport } from "viem";
import type { BaseSmartContractAccount } from "../account/base.js";
import type { PublicErc4337Client } from "../client/types.js";
import type { SmartAccountProvider } from "../provider/base.js";
import type { UserOperationRequest } from "../types.js";
import { deepHexlify, resolveProperties } from "../utils.js";

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

export interface AlchemyPaymasterConfig {
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
  Provider extends SmartAccountProvider<T> & {
    account: BaseSmartContractAccount<T>;
  }
>(
  provider: Provider,
  config: AlchemyPaymasterConfig
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
