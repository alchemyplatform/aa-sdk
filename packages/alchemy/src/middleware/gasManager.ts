import type { ClientMiddleware, ClientMiddlewareFn } from "@alchemy/aa-core";
import {
  deepHexlify,
  defaultGasEstimator,
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
import { alchemyFeeEstimator } from "./feeEstimator.js";

export type RequestGasAndPaymasterAndDataOverrides = Partial<{
  maxFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  maxPriorityFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  callGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
  preVerificationGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  verificationGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
}>;

export interface AlchemyGasManagerConfig {
  policyId: string;
  gasEstimationOptions?: AlchemyGasEstimationOptions;
}

export interface AlchemyGasEstimationOptions {
  disableGasEstimation: boolean;
  fallbackGasEstimator?: ClientMiddlewareFn;
  fallbackFeeDataGetter?: ClientMiddlewareFn;
}

export const alchemyGasManagerMiddleware = <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): Pick<
  ClientMiddleware,
  "dummyPaymasterAndData" | "paymasterAndData" | "feeEstimator" | "gasEstimator"
> => {
  const gasEstimationOptions = config.gasEstimationOptions;
  const disableGasEstimation =
    gasEstimationOptions?.disableGasEstimation ?? false;
  const fallbackFeeDataGetter =
    gasEstimationOptions?.fallbackFeeDataGetter ?? alchemyFeeEstimator(client);
  const fallbackGasEstimator =
    gasEstimationOptions?.fallbackGasEstimator ?? defaultGasEstimator(client);

  return {
    gasEstimator: disableGasEstimation
      ? fallbackGasEstimator
      : async (struct, { overrides, account, feeOptions }) => {
          const zeroEstimates = {
            callGasLimit: 0n,
            preVerificationGas: 0n,
            verificationGasLimit: 0n,
          };

          if (overrides?.paymasterAndData) {
            return {
              ...struct,
              ...zeroEstimates,
              ...fallbackGasEstimator(struct, {
                overrides,
                account,
                feeOptions,
              }),
            };
          }

          return {
            ...struct,
            callGasLimit: 0n,
            preVerificationGas: 0n,
            verificationGasLimit: 0n,
          };
        },
    feeEstimator: disableGasEstimation
      ? fallbackFeeDataGetter
      : async (struct, { overrides, account, feeOptions }) => {
          let maxFeePerGas = (await struct.maxFeePerGas) ?? 0n;
          let maxPriorityFeePerGas = (await struct.maxPriorityFeePerGas) ?? 0n;

          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides?.paymasterAndData === "0x") {
            const result = await fallbackFeeDataGetter(struct, {
              overrides,
              feeOptions,
              account,
            });
            maxFeePerGas = (await result.maxFeePerGas) ?? maxFeePerGas;
            maxPriorityFeePerGas =
              (await result.maxPriorityFeePerGas) ?? maxPriorityFeePerGas;
          }

          return {
            ...struct,
            maxFeePerGas,
            maxPriorityFeePerGas,
          };
        },
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
    paymasterAndData: disableGasEstimation
      ? requestPaymasterAndData(client, config)
      : requestGasAndPaymasterData(client, config),
  };
};

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

const requestPaymasterAndData: <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
) => ClientMiddlewareFn =
  (client, config) =>
  async (struct, { account }) => {
    const { paymasterAndData } = await client.request({
      method: "alchemy_requestPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: account.getEntrypoint(),
          userOperation: deepHexlify(await resolveProperties(struct)),
        },
      ],
    });

    return {
      ...struct,
      paymasterAndData,
    };
  };
