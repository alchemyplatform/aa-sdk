import type { ClientMiddleware, ClientMiddlewareFn } from "@alchemy/aa-core";
import {
  deepHexlify,
  filterUndefined,
  isBigNumberish,
  isPercentage,
  resolveProperties,
  type Hex,
  type Percentage,
  type UserOperationFeeOptions,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import { fromHex } from "viem";
import type { ClientWithAlchemyMethods } from "../client/types";

export type RequestGasAndPaymasterAndDataOverrides = Partial<{
  maxFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  maxPriorityFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  callGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
  preVerificationGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  verificationGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
}>;

export interface AlchemyGasManagerConfig {
  policyId: string;
}

export interface AlchemyGasEstimationOptions {
  estimateGas: boolean;
  fallbackGasEstimator?: ClientMiddlewareFn;
  fallbackFeeDataGetter?: ClientMiddlewareFn;
}

export const alchemyGasManagerMiddleware = <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): Pick<
  ClientMiddleware,
  "dummyPaymasterAndData" | "paymasterAndData" | "feeEstimator" | "gasEstimator"
> => ({
  // TODO: add support for the fallback methods and overrides
  // supported in the old provider
  gasEstimator: async (struct) => ({
    ...struct,
    callGasLimit: 0n,
    preVerificationGas: 0n,
    verificationGasLimit: 0n,
  }),
  feeEstimator: async (struct) => ({
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    ...struct,
  }),
  dummyPaymasterAndData: async (struct) => {
    switch (client.chain.id) {
      case 1:
      case 10:
      case 137:
      case 42161:
        return {
          ...struct,
          paymasterAndData:
            "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        };
      default:
        return {
          ...struct,
          paymasterAndData:
            "0xc03aac639bb21233e0139381970328db8bceeb67fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        };
    }
  },
  paymasterAndData: requestGasAndPaymasterData(client, config),
});

const requestGasAndPaymasterData: <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
) => ClientMiddlewareFn =
  (client, config) =>
  async (struct, { overrides, feeOptions, account }) => {
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

    const result = await client.request({
      method: "alchemy_requestGasAndPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: account.getEntrypoint(),
          userOperation: userOperation,
          dummySignature: userOperation.signature,
          overrides:
            Object.keys(_overrides).length > 0 ? _overrides : undefined,
        },
      ],
    });

    return {
      ...struct,
      ...result,
    };
  };
