import type {
  Address,
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
  EntryPointVersion,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import {
  deepHexlify,
  defaultGasEstimator,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  resolveProperties,
  type Multiplier,
  type UserOperationFeeOptions,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import { fromHex, type Hex } from "viem";
import type { ClientWithAlchemyMethods } from "../client/types";
import { getAlchemyPaymasterAddress } from "../gas-manager.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";

export type RequestGasAndPaymasterAndDataOverrides<
  TEntryPointVersion extends EntryPointVersion
> = Partial<
  {
    maxFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
    callGasLimit:
      | UserOperationRequest<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    verificationGasLimit:
      | UserOperationRequest<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    preVerificationGas:
      | UserOperationRequest<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
  } & TEntryPointVersion extends "0.7.0"
    ? {
        paymasterVerificationGasLimit:
          | UserOperationRequest<"0.7.0">["paymasterVerificationGasLimit"]
          | Multiplier;
        paymasterPostOpGasLimit:
          | UserOperationRequest<"0.7.0">["paymasterPostOpGasLimit"]
          | Multiplier;
      }
    : {}
>;

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

export function alchemyGasManagerMiddleware<C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): Pick<
  ClientMiddlewareConfig,
  "paymasterAndData" | "feeEstimator" | "gasEstimator"
> {
  const gasEstimationOptions = config.gasEstimationOptions;
  const disableGasEstimation =
    gasEstimationOptions?.disableGasEstimation ?? false;
  const fallbackFeeDataGetter =
    gasEstimationOptions?.fallbackFeeDataGetter ?? alchemyFeeEstimator(client);
  const fallbackGasEstimator =
    gasEstimationOptions?.fallbackGasEstimator ??
    defaultGasEstimator<C>(client);

  return {
    gasEstimator: disableGasEstimation
      ? fallbackGasEstimator
      : async (struct, { overrides, account, feeOptions }) => {
          const zeroEstimates = {
            callGasLimit: 0n,
            preVerificationGas: 0n,
            verificationGasLimit: 0n,
          };

          const entryPoint = account.getEntryPoint();

          if (
            entryPoint.version === "0.6.0"
              ? (overrides as UserOperationOverrides<"0.6.0">)?.paymasterAndData
              : (overrides as UserOperationOverrides<"0.7.0">)?.paymasterData
          ) {
            return {
              ...struct,
              ...zeroEstimates,
              ...fallbackGasEstimator(struct, {
                overrides,
                account,
                feeOptions,
                client,
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

          const entryPoint = account.getEntryPoint();
          // but if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (
            entryPoint.version === "0.6.0"
              ? (overrides as UserOperationOverrides<"0.6.0">)
                  ?.paymasterAndData === "0x"
              : (overrides as UserOperationOverrides<"0.7.0">)
                  ?.paymasterData === "0x"
          ) {
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
}

function requestGasAndPaymasterData<C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): ClientMiddlewareConfig["paymasterAndData"] {
  return {
    dummyPaymasterAndData: dummyPaymasterAndData(client, config),
    paymasterAndData: async (struct, { overrides, feeOptions, account }) => {
      const userOperation: UserOperationRequest<EntryPointVersion> =
        deepHexlify(await resolveProperties(struct));

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

        if (fromHex(userOperation[field], "bigint") > 0n) {
          return userOperation[field];
        }

        return undefined;
      };

      const _overrides: RequestGasAndPaymasterAndDataOverrides<EntryPointVersion> =
        filterUndefined({
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
  };
}

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
