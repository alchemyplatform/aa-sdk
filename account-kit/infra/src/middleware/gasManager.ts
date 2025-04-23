import type {
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
  EntryPointVersion,
  Multiplier,
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationRequest,
} from "@aa-sdk/core";
import {
  bypassPaymasterAndData,
  ChainNotFoundError,
  clientHeaderTrack,
  deepHexlify,
  defaultGasEstimator,
  erc7677Middleware,
  filterUndefined,
  isBigNumberish,
  isMultiplier,
  noopMiddleware,
  resolveProperties,
} from "@aa-sdk/core";
import { fromHex, isHex, type Hex } from "viem";
import type { AlchemySmartAccountClient } from "../client/smartAccountClient.js";
import type { AlchemyTransport } from "../alchemyTransport.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring
 * transactions. Adheres to the ERC-7677 standardized communication protocol.
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
 * @param {string | string[]} policyId the policyId (or list of policyIds) for Alchemy's gas manager
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string | string[]
): Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData"> {
  return erc7677Middleware<{ policyId: string | string[] }>({
    context: { policyId: policyId },
  });
}

interface AlchemyGasAndPaymasterAndDataMiddlewareParams {
  policyId: string | string[];
  transport: AlchemyTransport;
  gasEstimatorOverride?: ClientMiddlewareFn;
  feeEstimatorOverride?: ClientMiddlewareFn;
  policyToken?: PolicyToken;
}

export type PolicyToken = {
  address: string;
  approvalMode: ApprovalMode;
};

export enum ApprovalMode {
  INJECT_APPROVAL = 2,
  PERMIT = 1,
  NONE = 0,
}

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring
 * transactions. Uses Alchemy's custom `alchemy_requestGasAndPaymasterAndData`
 * method instead of conforming to the standard ERC-7677 interface. Note that
 * if you use `createAlchemySmartAccountClient`, this middleware is already
 * used by default and you do not need to manually include it.
 *
 * @example
 *  ```ts twoslash
 * import { sepolia, alchemy, alchemyGasAndPaymasterAndDataMiddleware } from "@account-kit/infra";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const client = createSmartAccountClient({
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
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams.gasEstimatorOverride} params.gasEstimatorOverride custom gas estimator middleware
 * @param {AlchemyGasAndPaymasterAndDataMiddlewareParams.feeEstimatorOverride} params.feeEstimatorOverride custom fee estimator middleware
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasAndPaymasterAndDataMiddleware(
  params: AlchemyGasAndPaymasterAndDataMiddlewareParams
): Pick<
  ClientMiddlewareConfig,
  "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData"
> {
  const {
    policyId,
    transport,
    gasEstimatorOverride,
    feeEstimatorOverride,
    policyToken,
  } = params;
  return {
    dummyPaymasterAndData: async (uo, args) => {
      if (
        // No reason to generate dummy data if we are bypassing the paymaster.
        bypassPaymasterAndData(args.overrides) ||
        // When using alchemy_requestGasAndPaymasterAndData, there is generally no reason to generate dummy
        // data. However, if the gas/feeEstimator is overriden, then this option should be enabled.
        !(gasEstimatorOverride || feeEstimatorOverride)
      ) {
        return noopMiddleware(uo, args);
      }

      // Fall back to the default 7677 dummyPaymasterAndData middleware.
      return alchemyGasManagerMiddleware(policyId).dummyPaymasterAndData!(
        uo,
        args
      );
    },
    feeEstimator: (uo, args) => {
      return feeEstimatorOverride
        ? feeEstimatorOverride(uo, args)
        : bypassPaymasterAndData(args.overrides)
        ? alchemyFeeEstimator(transport)(uo, args)
        : noopMiddleware(uo, args);
    },
    gasEstimator: (uo, args) => {
      return gasEstimatorOverride
        ? gasEstimatorOverride(uo, args)
        : bypassPaymasterAndData(args.overrides)
        ? defaultGasEstimator(args.client)(uo, args)
        : noopMiddleware(uo, args);
    },
    paymasterAndData: async (
      uo,
      { account, client: client_, feeOptions, overrides: overrides_ }
    ) => {
      const client = clientHeaderTrack(client_, "alchemyFeeEstimator");
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
            ...(policyToken
              ? {
                  erc20Context: {
                    tokenAddress: policyToken.address,
                  },
                }
              : {}),
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
