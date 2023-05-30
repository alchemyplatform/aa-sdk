import type { Address, Hex } from "viem";
import type { PublicErc4337Client } from "../client/types.js";
import type { UserOperationRequest, UserOperationStruct } from "../types.js";
import { deepHexlify, resolveProperties } from "../utils.js";
import type { ISmartAccountProvider } from "../provider/types.js";

type ClientWithAlchemyMethod = PublicErc4337Client & {
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
    }["request"];
};

export interface AlchemyPaymasterConfig {
  policyId: string;
  entryPoint: Address;
  provider: PublicErc4337Client;
}

export const alchemyPaymasterAndDataMiddleware = (
  config: AlchemyPaymasterConfig
): Parameters<ISmartAccountProvider["withPaymasterMiddleware"]>["0"] => ({
  dummyPaymasterDataMiddleware: async (_struct: UserOperationStruct) => {
    return {
      paymasterAndData:
        "0xc03aac639bb21233e0139381970328db8bceeb67fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    };
  },
  paymasterDataMiddleware: async (struct: UserOperationStruct) => {
    const { paymasterAndData } = await (
      config.provider as ClientWithAlchemyMethod
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
