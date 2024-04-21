import type {
  Address,
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
  EntryPointVersion,
  Multiplier,
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationRequest,
} from "@alchemy/aa-core";
import {
  bypassPaymasterAndData,
  deepHexlify,
  defaultGasEstimator,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  resolveProperties,
} from "@alchemy/aa-core";
import { fromHex, isHex, type Hex } from "viem";
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

export type RequestPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? {
      paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
    }
  : TEntryPointVersion extends "0.7.0"
  ? Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">
  : {};

export type RequestGasAndPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion
> = Pick<
  UserOperationRequest<EntryPointVersion>,
  | "callGasLimit"
  | "preVerificationGas"
  | "verificationGasLimit"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
> &
  RequestPaymasterAndDataResponse<TEntryPointVersion>;

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
          // if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides && bypassPaymasterAndData(overrides)) {
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

          // essentially noop, because the gas estimation will happen in the backend
          return struct;
        },
    feeEstimator: disableGasEstimation
      ? fallbackFeeDataGetter
      : async (struct, { overrides, account, feeOptions }) => {
          let maxFeePerGas = await struct.maxFeePerGas;
          let maxPriorityFeePerGas = await struct.maxPriorityFeePerGas;

          // if user is bypassing paymaster to fallback to having the account to pay the gas (one-off override),
          // we cannot delegate gas estimation to the bundler because paymaster middleware will not be called
          if (overrides && bypassPaymasterAndData(overrides)) {
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

const overrideField = <TEntryPointVersion extends EntryPointVersion>(
  field: keyof UserOperationFeeOptions<TEntryPointVersion>,
  overrides: UserOperationOverrides<TEntryPointVersion> | undefined,
  feeOptions: UserOperationFeeOptions<TEntryPointVersion> | undefined,
  userOperation: UserOperationRequest<TEntryPointVersion>
): Hex | Multiplier | undefined => {
  let _field = field as keyof UserOperationOverrides<TEntryPointVersion>;

  if (overrides?.[_field] != null) {
    // one-off absolute override
    if (isBigNumberish(overrides[_field])) {
      return deepHexlify(overrides[_field]);
    }
    // one-off multiplier overrides
    else {
      return {
        multiplier: Number((overrides[_field] as Multiplier).multiplier),
      };
    }
  }

  // provider level fee options with multiplier
  if (isMultiplier(feeOptions?.[field])) {
    return {
      multiplier: Number((feeOptions![field] as Multiplier).multiplier),
    };
  }

  const userOpField =
    userOperation[field as keyof UserOperationRequest<TEntryPointVersion>];
  if (isHex(userOpField) && fromHex(userOpField as Hex, "bigint") > 0n) {
    return userOpField;
  }
  return undefined;
};

function requestGasAndPaymasterData<C extends ClientWithAlchemyMethods>(
  client: C,
  config: AlchemyGasManagerConfig
): ClientMiddlewareConfig["paymasterAndData"] {
  return {
    dummyPaymasterAndData: dummyPaymasterAndData(client, config),
    paymasterAndData: async (
      struct,
      { overrides: overrides_, feeOptions, account }
    ) => {
      const userOperation: UserOperationRequest<EntryPointVersion> =
        deepHexlify(await resolveProperties(struct));

      const overrides: RequestGasAndPaymasterAndDataOverrides<EntryPointVersion> =
        filterUndefined({
          maxFeePerGas: overrideField(
            "maxFeePerGas",
            overrides_ as UserOperationOverrides<EntryPointVersion>,
            feeOptions,
            userOperation
          ),
          maxPriorityFeePerGas: overrideField(
            "maxPriorityFeePerGas",
            overrides_ as UserOperationOverrides<EntryPointVersion>,
            feeOptions,
            userOperation
          ),
          callGasLimit: overrideField(
            "callGasLimit",
            overrides_ as UserOperationOverrides<EntryPointVersion>,
            feeOptions,
            userOperation
          ),
          verificationGasLimit: overrideField(
            "verificationGasLimit",
            overrides_ as UserOperationOverrides<EntryPointVersion>,
            feeOptions,
            userOperation
          ),
          preVerificationGas: overrideField(
            "preVerificationGas",
            overrides_ as UserOperationOverrides<EntryPointVersion>,
            feeOptions,
            userOperation
          ),
        });

      if (account.getEntryPoint().version === "0.7.0") {
        const paymasterVerificationGasLimit = overrideField<"0.7.0">(
          "paymasterVerificationGasLimit",
          overrides_ as UserOperationOverrides<"0.7.0">,
          feeOptions,
          userOperation
        );
        if (paymasterVerificationGasLimit != null) {
          (
            overrides as RequestGasAndPaymasterAndDataOverrides<"0.7.0">
          ).paymasterVerificationGasLimit = paymasterVerificationGasLimit;
        }

        const paymasterPostOpGasLimit = overrideField<"0.7.0">(
          "paymasterPostOpGasLimit",
          overrides_ as UserOperationOverrides<"0.7.0">,
          feeOptions,
          userOperation
        );
        if (paymasterPostOpGasLimit != null) {
          (
            overrides as RequestGasAndPaymasterAndDataOverrides<"0.7.0">
          ).paymasterPostOpGasLimit = paymasterPostOpGasLimit;
        }
      }

      const result = await client.request({
        method: "alchemy_requestGasAndPaymasterAndData",
        params: [
          {
            policyId: config.policyId,
            entryPoint: account.getEntryPoint().address,
            userOperation,
            dummySignature: userOperation.signature,
            overrides,
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
    const result = await client.request({
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
      ...result,
    };
  },
});
