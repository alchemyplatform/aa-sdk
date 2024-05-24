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
  bypassPaymasterAndDataEmptyHex,
  deepHexlify,
  defaultGasEstimator,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  resolveProperties,
} from "@alchemy/aa-core";
import { concat, fromHex, isHex, type Hex } from "viem";
import type { ClientWithAlchemyMethods } from "../client/types";
import { getAlchemyPaymasterAddress } from "../gas-manager.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";

/**
 * overrides value for [`alchemy_requestGasAndPaymasterData`](https://docs.alchemy.com/reference/alchemy-requestgasandpaymasteranddata)
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestGasAndPaymasterAndDataOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
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

/**
 * [`alchemy-requestpaymasteranddata`](https://docs.alchemy.com/reference/alchemy-requestpaymasteranddata)
 * response type
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? {
      paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
    }
  : TEntryPointVersion extends "0.7.0"
  ? Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">
  : {};

/**
 * [`alchemy_requestGasAndPaymasterData`](https://docs.alchemy.com/reference/alchemy-requestgasandpaymasteranddata)
 * response type
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestGasAndPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = Pick<
  UserOperationRequest,
  | "callGasLimit"
  | "preVerificationGas"
  | "verificationGasLimit"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
> &
  RequestPaymasterAndDataResponse<TEntryPointVersion>;

/**
 * Alchemy gas manager configuration with gas policy id and optional gas estimation options
 *
 * To create a Gas Manager Policy, go to the [gas manager](https://dashboard.alchemy.com/gas-manager?a=embedded-accounts-get-started)
 * page of the Alchemy dashboard and click the “Create new policy” button.
 */
export interface AlchemyGasManagerConfig {
  /**
   * the policy id of the gas manager you want to use.
   *
   */
  policyId: string;
  /**
   * optional option configurable for the gas estimation portion of the Alchemy gas manager
   *
   */
  gasEstimationOptions?: AlchemyGasEstimationOptions;
  /**
   * paymaster address to use for the gas estimation.
   * If not provided, the default paymaster address for the chain will be used.
   *
   */
  paymasterAddress?: Address;
  /**
   * dummy paymaster data to use for the gas estimation.
   *
   */
  dummyData?: Hex;
}

/**
 * Alchemy gas manager configuration option configurable for the gas estimation portion of the Alchemy gas manager
 *
 */
export interface AlchemyGasEstimationOptions {
  /**
   * disable gas estimation and fallback to the default gas estimation.
   *
   */
  disableGasEstimation: boolean;
  /**
   * optional fallback gas estimator to use when gas estimation is disabled.
   *
   */
  fallbackGasEstimator?: ClientMiddlewareFn;
  /**
   * optional fallback fee estimator to use when gas estimation is disabled.
   *
   */
  fallbackFeeDataGetter?: ClientMiddlewareFn;
}

/**
 * dummy paymaster and data middleware for the alchemy gas manager
 *
 * @template {ClientWithAlchemyMethods} C
 * @param client client with alchemy methods
 * @param config alchemy gas manager configuration
 * @returns the dummyPaymasterAndData middleware for Alchemy gas manager
 */
const dummyPaymasterAndData =
  <C extends ClientWithAlchemyMethods>(
    client: C,
    config: AlchemyGasManagerConfig
  ) =>
  () => {
    const paymaster =
      config.paymasterAddress ?? getAlchemyPaymasterAddress(client.chain);
    const paymasterData =
      config.dummyData ??
      "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

    return concat([paymaster, paymasterData]); // or you can also return { paymaster, paymasterData }
  };

/**
 * Alchemy gas manager middleware used as the paymaster middleware overrides param to the client middleware config
 *
 * @template {ClientWithAlchemyMethods} C
 * @param client client with alchemy methods
 * @param config alchemy gas manager configuration
 * @returns the gas estimator, fee estimator, and paymasterAndData middleware for Alchemy gas manager
 */
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
          if (bypassPaymasterAndDataEmptyHex(overrides)) {
            return {
              ...struct,
              ...(await fallbackGasEstimator(struct, {
                overrides,
                account,
                feeOptions,
                client,
              })),
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
          if (bypassPaymasterAndDataEmptyHex(overrides)) {
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

/**
 * Utility function to override a field in the user operation request with the overrides or fee options
 *
 * @template {EntryPointVersion} TEntryPointVersion
 * @param field the field to override
 * @param overrides the overrides object
 * @param feeOptions the fee options object from the client
 * @param userOperation the user operation request
 * @returns the overridden field value
 */
const overrideField = <
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
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

/**
 * Alchemy gas manager middleware function that returns the paymaster middleware for the client middleware config
 * that calls the [`alchemy_requestGasAndPaymasterAndData`](https://docs.alchemy.com/reference/alchemy-requestgasandpaymasteranddata)
 *
 * @template {ClientWithAlchemyMethods} C
 * @param client client with alchemy methods
 * @param config alchemy gas manager configuration
 * @returns the paymasterAndData middleware for Alchemy gas manager
 */
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
      const userOperation: UserOperationRequest = deepHexlify(
        await resolveProperties(struct)
      );

      const overrides: RequestGasAndPaymasterAndDataOverrides = filterUndefined(
        {
          maxFeePerGas: overrideField(
            "maxFeePerGas",
            overrides_ as UserOperationOverrides,
            feeOptions,
            userOperation
          ),
          maxPriorityFeePerGas: overrideField(
            "maxPriorityFeePerGas",
            overrides_ as UserOperationOverrides,
            feeOptions,
            userOperation
          ),
          callGasLimit: overrideField(
            "callGasLimit",
            overrides_ as UserOperationOverrides,
            feeOptions,
            userOperation
          ),
          verificationGasLimit: overrideField(
            "verificationGasLimit",
            overrides_ as UserOperationOverrides,
            feeOptions,
            userOperation
          ),
          preVerificationGas: overrideField(
            "preVerificationGas",
            overrides_ as UserOperationOverrides,
            feeOptions,
            userOperation
          ),
        }
      );

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

/**
 * Alchemy gas manager middleware function that returns the paymaster middleware for the client middleware config
 * that calls the [`alchemy_requestPaymasterAndData`](https://docs.alchemy.com/reference/alchemy-requestpaymasteranddata)
 * with gas estimation disabled.
 *
 * @param client client with alchemy methods
 * @param config alchemy gas manager configuration
 * @returns the paymasterAndData middleware for Alchemy gas manager with gas estimation disabled
 */
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
