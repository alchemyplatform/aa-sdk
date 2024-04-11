import type {
  Address,
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
} from "@alchemy/aa-core";
import {
  deepHexlify,
  defaultGasEstimator,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  resolveProperties,
  type Hex,
  type Multiplier,
  type UserOperationFeeOptions,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import { fromHex } from "viem";
import type { ClientWithAlchemyMethods } from "../client/types";
import { getAlchemyPaymasterAddress } from "../gas-manager.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";

export type RequestGasAndPaymasterAndDataOverrides = Partial<{
  maxFeePerGas: UserOperationRequest["maxFeePerGas"] | Multiplier;
  maxPriorityFeePerGas: UserOperationRequest["maxFeePerGas"] | Multiplier;
  callGasLimit: UserOperationRequest["maxFeePerGas"] | Multiplier;
  preVerificationGas: UserOperationRequest["maxFeePerGas"] | Multiplier;
  verificationGasLimit: UserOperationRequest["maxFeePerGas"] | Multiplier;
}>;

export interface AlchemyGasManagerConfig {
  policyId: string;
  gasEstimationOptions?: AlchemyGasEstimationOptions;
  paymasterAddress?: Address;
  dummyData?: Hex;
}

export interface AlchemyGasEstimationOptions {
  disableGasEstimation: boolean;
  fallbackGasEstimator?: ClientMiddlewareFn;
  fallbackFeeDataGetter?: ClientMiddlewareFn;
}

const dummyPaymasterAndData =
  <C extends ClientWithAlchemyMethods>(
    client: C,
    config: AlchemyGasManagerConfig
  ) =>
  () => {
    const paymasterAddress =
      config.paymasterAddress ?? getAlchemyPaymasterAddress(client.chain);
    const dummyData =
      config.dummyData ??
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

    return `${paymasterAddress}${dummyData}` as Address;
  };

export const alchemyGasManagerMiddleware = <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): Pick<
  ClientMiddlewareConfig,
  "paymasterAndData" | "feeEstimator" | "gasEstimator"
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
          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides?.paymasterAndData === "0x") {
            return {
              ...struct,
              ...fallbackGasEstimator(struct, {
                overrides,
                account,
                feeOptions,
                client,
              }),
            };
          }

          // essentiall noop, because the gas estimation will happen in the backend
          return struct;
        },
    feeEstimator: disableGasEstimation
      ? fallbackFeeDataGetter
      : async (struct, { overrides, account, feeOptions }) => {
          let maxFeePerGas = await struct.maxFeePerGas;
          let maxPriorityFeePerGas = await struct.maxPriorityFeePerGas;

          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides?.paymasterAndData === "0x") {
            const result = await fallbackFeeDataGetter(struct, {
              overrides,
              feeOptions,
              account,
              client,
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
    paymasterAndData: disableGasEstimation
      ? requestPaymasterAndData(client, config)
      : requestGasAndPaymasterData(client, config),
  };
};

const requestGasAndPaymasterData: <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
) => ClientMiddlewareConfig["paymasterAndData"] = (client, config) => ({
  dummyPaymasterAndData: dummyPaymasterAndData(client, config),
  paymasterAndData: async (struct, { overrides, feeOptions, account }) => {
    const userOperation: UserOperationRequest = deepHexlify(
      await resolveProperties(struct)
    );

    const overrideField = (
      field: keyof UserOperationFeeOptions
    ): Hex | Multiplier | undefined => {
      if (overrides?.[field] != null) {
        // one-off absolute override
        if (isBigNumberish(overrides[field])) {
          return deepHexlify(overrides[field]);
        }
        // one-off multiplier overrides
        else {
          return {
            multiplier: Number((overrides[field] as Multiplier).multiplier),
          };
        }
      }

      // provider level fee options with multiplier
      if (isMultiplier(feeOptions?.[field])) {
        return {
          multiplier: Number((feeOptions![field] as Multiplier).multiplier),
        };
      }

      if (
        userOperation[field] != null &&
        fromHex(userOperation[field], "bigint") > 0n
      ) {
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
          entryPoint: account.getEntryPoint().address,
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
  },
});

const requestPaymasterAndData: <C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
) => ClientMiddlewareConfig["paymasterAndData"] = (client, config) => ({
  dummyPaymasterAndData: dummyPaymasterAndData(client, config),
  paymasterAndData: async (struct, { account }) => {
    const { paymasterAndData } = await client.request({
      method: "alchemy_requestPaymasterAndData",
      params: [
        {
          policyId: config.policyId,
          entryPoint: account.getEntryPoint().address,
          userOperation: deepHexlify(await resolveProperties(struct)),
        },
      ],
    });

    return {
      ...struct,
      paymasterAndData,
    };
  },
});
