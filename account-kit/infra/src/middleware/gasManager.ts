import type {
  Address,
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
  EntryPointVersion,
  Erc7677Client,
  Multiplier,
  SmartContractAccount,
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
import {
  fromHex,
  isHex,
  toHex,
  type Hex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
  maxUint256,
  sliceHex,
} from "viem";
import type { AlchemySmartAccountClient } from "../client/smartAccountClient.js";
import type { AlchemyTransport } from "../alchemyTransport.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";
import type { RequestGasAndPaymasterAndDataRequest } from "../actions/types.js";
import { PermitTypes, EIP712NoncesAbi } from "../gas-manager.js";
import type { PermitMessage, PermitDomain } from "../gas-manager.js";
import type { MiddlewareClient } from "../../../../aa-sdk/core/dist/types/middleware/actions.js";

type Context = {
  policyId: string | string[];
  erc20Context?: {
    tokenAddress: Address;
    maxTokenAmount?: BigInt;
    permit?: Hex;
  };
};
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
 * @param {string | string[]} policyId - The policyId (or list of policyIds) for Alchemy's gas manager
 * @param {PolicyToken | undefined} policyToken - The policy token configuration
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} Partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string | string[],
  policyToken?: PolicyToken
): Required<
  Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">
> {
  const buildContext = async (
    uo: Parameters<ClientMiddlewareFn>[0],
    args: Parameters<ClientMiddlewareFn>[1]
  ): Promise<Context> => {
    const context: Context = { policyId };

    const { account, client } = args;
    if (!client.chain) {
      throw new ChainNotFoundError();
    }

    if (policyToken !== undefined) {
      const userOp = await deepHexlify(await resolveProperties(uo));
      context.erc20Context = {
        tokenAddress: policyToken.address,
        ...(policyToken.maxTokenAmount
          ? { maxTokenAmount: policyToken.maxTokenAmount }
          : {}),
      };

      if (policyToken.approvalMode === "PERMIT") {
        context.erc20Context.permit = await generateSignedPermit(
          userOp,
          client as AlchemySmartAccountClient,
          account,
          policyId,
          policyToken
        );
      }
    }

    return context;
  };
  return {
    dummyPaymasterAndData: async (uo, args) => {
      const context = await buildContext(uo, args);
      const baseMiddleware = erc7677Middleware({ context });
      return baseMiddleware.dummyPaymasterAndData(uo, args);
    },

    paymasterAndData: async (uo, args) => {
      const context = await buildContext(uo, args);
      const baseMiddleware = erc7677Middleware({ context });
      return baseMiddleware.paymasterAndData(uo, args);
    },
  };
}

interface AlchemyGasAndPaymasterAndDataMiddlewareParams {
  policyId: string | string[];
  policyToken?: PolicyToken;
  transport: AlchemyTransport;
  gasEstimatorOverride?: ClientMiddlewareFn;
  feeEstimatorOverride?: ClientMiddlewareFn;
}

export type PolicyToken = {
  address: Address;
  maxTokenAmount?: bigint;
  approvalMode?: "NONE" | "PERMIT";
  erc20Name?: string;
  version?: string;
};

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
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData`, `feeEstimator`, `gasEstimator`, and `paymasterAndData`
 */
export function alchemyGasAndPaymasterAndDataMiddleware(
  params: AlchemyGasAndPaymasterAndDataMiddlewareParams
): Pick<
  ClientMiddlewareConfig,
  "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData"
> {
  const {
    policyId,
    policyToken,
    transport,
    gasEstimatorOverride,
    feeEstimatorOverride,
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
      return alchemyGasManagerMiddleware(
        policyId,
        policyToken
      ).dummyPaymasterAndData(uo, args);
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

      let erc20Context: RequestGasAndPaymasterAndDataRequest[0]["erc20Context"] =
        undefined;
      if (policyToken !== undefined) {
        erc20Context = {
          tokenAddress: policyToken.address,
          ...(policyToken.maxTokenAmount
            ? { maxTokenAmount: policyToken.maxTokenAmount }
            : {}),
        };
        if (policyToken.approvalMode === "PERMIT") {
          erc20Context.permit = await generateSignedPermit(
            userOp,
            client,
            account,
            policyId,
            policyToken
          );
        }
      }

      const result = await (client as AlchemySmartAccountClient).request({
        method: "alchemy_requestGasAndPaymasterAndData",
        params: [
          {
            policyId,
            entryPoint: account.getEntryPoint().address,
            userOperation: userOp,
            dummySignature: await account.getDummySignature(),
            overrides,
            ...(erc20Context
              ? {
                  erc20Context,
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

/**
 * Utility function to generate a signed Permit for erc20 transaction
 *
 * @param {UserOperationRequest<TEntryPointVersion>} userOp - The user operation request
 * @param {MiddlewareClient} client - The Alchemy smart account client
 * @param {TAccount} account - The smart account instance
 * @param {string | string[]} policyId - The policy ID or array of policy IDs
 * @param {PolicyToken} policyToken - The policy token configuration
 * @param {Address} policyToken.address - ERC20 contract addressya
 * @param {bigint} [policyToken.maxTokenAmount] - Optional ERC20 token limit
 * @param {"NONE" | "PERMIT"} [policyToken.approvalMode] - ERC20 approve mode
 * @param {string} [policyToken.erc20Name] - EIP2612 specified ERC20 contract name
 * @param {string} [policyToken.version] - EIP2612 specified ERC20 contract version
 * @returns {Promise<Hex>} Returns a Promise containing the signed EIP2612 permit
 */
const generateSignedPermit = async <
  TAccount extends SmartContractAccount,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  userOp: UserOperationRequest<TEntryPointVersion>,
  client: MiddlewareClient,
  account: TAccount,
  policyId: string | string[],
  policyToken: {
    address: Address;
    maxTokenAmount?: bigint;
    approvalMode?: "NONE" | "PERMIT";
    erc20Name?: string;
    version?: string;
  }
): Promise<Hex> => {
  if (!client.chain) {
    throw new ChainNotFoundError();
  }
  if (!policyToken.erc20Name || !policyToken.version) {
    throw new Error("erc20Name or version is missing");
  }
  // get a paymaster address
  const maxAmountToken = policyToken.maxTokenAmount || maxUint256;
  const paymasterData = await (client as Erc7677Client).request({
    method: "pm_getPaymasterStubData",
    params: [
      userOp,
      account.getEntryPoint().address,
      toHex(client.chain.id),
      {
        policyId: Array.isArray(policyId) ? policyId[0] : policyId,
      },
    ],
  });

  const paymasterAddress = paymasterData.paymaster
    ? paymasterData.paymaster
    : paymasterData.paymasterAndData
    ? sliceHex(paymasterData.paymasterAndData, 0, 20)
    : undefined;

  if (paymasterAddress === undefined || paymasterAddress === "0x") {
    throw new Error("no paymaster contract address available");
  }
  const deadline = maxUint256;
  const { data } = await client.call({
    to: policyToken.address,
    data: encodeFunctionData({
      abi: parseAbi(EIP712NoncesAbi),
      functionName: "nonces",
      args: [account.address],
    }),
  });
  if (!data) {
    throw new Error("No nonces returned from erc20 contract call");
  }

  const typedPermitData = {
    types: PermitTypes,
    primaryType: "Permit" as const,
    domain: {
      name: policyToken.erc20Name ?? "",
      version: policyToken.version ?? "",
      chainId: BigInt(client.chain.id),
      verifyingContract: policyToken.address,
    } satisfies PermitDomain,
    message: {
      owner: account.address,
      spender: paymasterAddress,
      value: maxAmountToken,
      nonce: BigInt(data),
      deadline,
    } satisfies PermitMessage,
  } as const;

  const signedPermit = await account.signTypedData(typedPermitData);
  return encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }, { type: "bytes" }],
    [maxAmountToken, deadline, signedPermit]
  );
};
