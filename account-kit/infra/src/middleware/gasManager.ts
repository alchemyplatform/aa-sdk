import type {
  ClientMiddlewareConfig,
  EntryPointVersion,
  Multiplier,
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationRequest,
} from "@aa-sdk/core";
import {
  bypassPaymasterAndData,
  ChainNotFoundError,
  deepHexlify,
  defaultGasEstimator,
  erc7677Middleware,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  noopMiddleware,
  resolveProperties,
} from "@aa-sdk/core";
import { getAlchemyPaymasterAddress } from "../gas-manager.js";
import { fromHex, isHex, type Hex } from "viem";
import type { AlchemySmartAccountClient } from "../client/smartAccountClient.js";
import type { AlchemyTransport } from "../alchemyTransport.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring transactions.
 *
 * @example
 *  ```ts
 * import { sepolia, alchemyGasManagerMiddleware } from "@account-kit/infra";
 * import { http } from "viem";
 *
 * const client = createSmartAccountClient({
 *  transport: http("rpc-url"),
 *  chain: sepolia,
 *  ...alchemyGasManagerMiddleware("policyId")
 * });
 * ```
 *
 * @param {string} policyId the policyId for Alchemy's gas manager
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string
): Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData"> {
  return erc7677Middleware<{ policyId: string }>({
    context: { policyId: policyId },
  });
}

interface AlchemyGasAndPaymasterAndDataMiddlewareParams {
  policyId: string;
  transport: AlchemyTransport;
  enableDummyPaymasterAndData?: boolean;
}

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring transactions using
 * the `alchemy_requestGasAndPaymasterAndData` method instead of standard ERC-7677 methods.
 *
 * @example
 *  ```ts
 * import { sepolia, alchemyGasAndPaymasterAndDataMiddleware } from "@account-kit/infra";
 * import { alchemy } from "@account-kit/infra";
 *
 * const client = createAlchemySmartAccountClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
 *  ...alchemyGasAndPaymasterAndDataMiddleware({
 *    policyId: "policyId",
 *    transport: alchemy({ apiKey: "your-api-key" }),
 *  })
 * });
 * ```
 *
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams} params configuration params
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams.policyId} params.policyId the policyId for Alchemy's gas manager
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams.transport} params.transport fallback transport to use for fee estimation when not using the paymaster
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams.enableDummyPaymasterAndData} params.enableDummyPaymasterAndData whether to enable the dummy paymaster and data middleware, which typically is only needed if the client is using a custom gasEstimator or feeEstimator
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasAndPaymasterAndDataMiddleware(
  params: AlchemyGasAndPaymasterAndDataMiddlewareParams
): Pick<
  ClientMiddlewareConfig,
  "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData"
> {
  const { policyId, transport, enableDummyPaymasterAndData } = params;
  return {
    dummyPaymasterAndData: async (uo, args) => {
      if (!args.client.chain) {
        throw new ChainNotFoundError();
      }

      if (
        // No reason to generate stub data if we are bypassing the paymaster.
        bypassPaymasterAndData(args.overrides) ||
        // TODO(jh): Is this safe to do? Is my thinking that we normally don't need to actually do anything in
        // this middleware function if using the default feeEstimator/gasEstimator correct, b/c the paymasterAndData
        // middleware function should handle everything?
        !enableDummyPaymasterAndData
      ) {
        return noopMiddleware(uo, args);
      }

      const paymaster = getAlchemyPaymasterAddress(args.client.chain); // throws if unsupported chain
      const paymasterData = await args.account.getDummySignature();

      return {
        ...uo,
        paymaster,
        paymasterData,
      };
    },
    feeEstimator: (uo, args) => {
      return bypassPaymasterAndData(args.overrides)
        ? alchemyFeeEstimator(transport)(uo, args)
        : noopMiddleware(uo, args);
    },
    gasEstimator: (uo, args) => {
      return bypassPaymasterAndData(args.overrides)
        ? defaultGasEstimator(args.client)(uo, args)
        : noopMiddleware(uo, args);
    },
    paymasterAndData: async (
      uo,
      { account, client, feeOptions, overrides: overrides_ }
    ) => {
      if (!client.chain) {
        throw new ChainNotFoundError();
      }

      const userOp = deepHexlify(await resolveProperties(uo));

      const overrides: UserOperationOverrides = filterUndefined({
        maxFeePerGas: overrideField(
          "maxFeePerGas",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp
        ),
        maxPriorityFeePerGas: overrideField(
          "maxPriorityFeePerGas",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp
        ),
        callGasLimit: overrideField(
          "callGasLimit",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp
        ),
        verificationGasLimit: overrideField(
          "verificationGasLimit",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp
        ),
        preVerificationGas: overrideField(
          "preVerificationGas",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp
        ),
        ...(account.getEntryPoint().version === "0.7.0"
          ? {
              paymasterVerificationGasLimit: overrideField<"0.7.0">(
                "paymasterVerificationGasLimit",
                overrides_ as UserOperationOverrides<"0.7.0">,
                feeOptions,
                userOp
              ),
              paymasterPostOpGasLimit: overrideField<"0.7.0">(
                "paymasterPostOpGasLimit",
                overrides_ as UserOperationOverrides<"0.7.0">,
                feeOptions,
                userOp
              ),
            }
          : {}),
      });

      const result = await (client as AlchemySmartAccountClient).request({
        method: "alchemy_requestGasAndPaymasterAndData",
        params: [
          {
            policyId,
            entryPoint: account.getEntryPoint().address,
            userOperation: userOp,
            dummySignature: await account.getDummySignature(),
            overrides,
          },
        ],
      });

      return {
        ...uo,
        ...result,
      };
    },
  };
}

/**
 * Utility function to override a field in the user operation request with the overrides or fee options
 *
 * @template {EntryPointVersion} TEntryPointVersion
 * @param {keyof UserOperationFeeOptions<TEntryPointVersion>} field the field to override
 * @param {UserOperationOverrides<TEntryPointVersion> | undefined} overrides the overrides object
 * @param {UserOperationFeeOptions<TEntryPointVersion> | undefined} feeOptions the fee options object from the client
 * @param {UserOperationRequest<TEntryPointVersion>} userOperation the user operation request
 * @returns {Hex | Multiplier | undefined} the overridden field value
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
