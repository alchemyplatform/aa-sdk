import type {
  Address,
  ClientMiddlewareConfig,
  ClientMiddlewareFn,
  EntryPointVersion,
  Multiplier,
  SmartContractAccount,
  UserOperationContext,
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
  type Hex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
} from "viem";
import type { AlchemySmartAccountClient } from "../client/smartAccountClient.js";
import type { AlchemyTransport } from "../alchemyTransport.js";
import { alchemyFeeEstimator } from "./feeEstimator.js";
import type { RequestGasAndPaymasterAndDataRequest } from "../actions/types.js";

import {
  PermitTypes,
  EIP7597Abis,
  ERC20Abis,
  getAlchemyPaymasterAddress,
} from "../gas-manager.js";
import type { PermitMessage, PermitDomain } from "../gas-manager.js";
import type { MiddlewareClient } from "@aa-sdk/core";
import { InvalidSignedPermit } from "../errors/invalidSignedPermit.js";

export type PaymasterContext = {
  policyId: string | string[];
  erc20Context?: {
    tokenAddress: Address;
    maxTokenAmount?: bigint;
    permit?: Hex;
  };
  webhookData?: string;
};

export type PolicyToken = {
  address: Address;
  maxTokenAmount: bigint;
  permit?: {
    paymasterAddress?: Address;
    autoPermitApproveTo: bigint;
    autoPermitBelow: bigint;
    erc20Name: string;
    version: string;
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
 * @param {string | undefined} webhookData - The webhook data to include in the request
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} Partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string | string[],
  policyToken?: PolicyToken,
  webhookData?: string,
): Required<
  Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">
> {
  const buildContext = async (
    args: Parameters<ClientMiddlewareFn>[1],
  ): Promise<PaymasterContext> => {
    const context: PaymasterContext = { policyId };

    const { account, client } = args;
    if (!client.chain) {
      throw new ChainNotFoundError();
    }

    if (policyToken !== undefined) {
      context.erc20Context = {
        tokenAddress: policyToken.address,
        maxTokenAmount: policyToken.maxTokenAmount,
      };

      if (policyToken.permit !== undefined) {
        const permit = await generateSignedPermit(client, account, policyToken);
        if (permit !== undefined) {
          context.erc20Context.permit = permit;
        }
      } else if (args.context !== undefined) {
        context.erc20Context.permit = extractSignedPermitFromContext(
          args.context,
        );
      }
    }

    if (webhookData !== undefined) {
      context.webhookData = webhookData;
    }

    return context;
  };
  return {
    dummyPaymasterAndData: async (uo, args) => {
      const context = await buildContext(args);
      const baseMiddleware = erc7677Middleware({ context });
      return baseMiddleware.dummyPaymasterAndData(uo, args);
    },

    paymasterAndData: async (uo, args) => {
      const context = await buildContext(args);
      const baseMiddleware = erc7677Middleware({ context });
      return baseMiddleware.paymasterAndData(uo, args);
    },
  };
}

interface AlchemyGasAndPaymasterAndDataMiddlewareParams {
  policyId: string | string[];
  policyToken?: PolicyToken;
  webhookData?: string;
  transport: AlchemyTransport;
  gasEstimatorOverride?: ClientMiddlewareFn;
  feeEstimatorOverride?: ClientMiddlewareFn;
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
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData`, `feeEstimator`, `gasEstimator`, and `paymasterAndData`
 */
export function alchemyGasAndPaymasterAndDataMiddleware(
  params: AlchemyGasAndPaymasterAndDataMiddlewareParams,
): Pick<
  ClientMiddlewareConfig,
  "dummyPaymasterAndData" | "feeEstimator" | "gasEstimator" | "paymasterAndData"
> {
  const {
    policyId,
    policyToken,
    transport,
    webhookData,
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
        policyToken,
        webhookData,
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
      {
        account,
        client: client_,
        feeOptions,
        overrides: overrides_,
        context: uoContext,
      },
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
          userOp,
        ),
        maxPriorityFeePerGas: overrideField(
          "maxPriorityFeePerGas",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp,
        ),
        callGasLimit: overrideField(
          "callGasLimit",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp,
        ),
        verificationGasLimit: overrideField(
          "verificationGasLimit",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp,
        ),
        preVerificationGas: overrideField(
          "preVerificationGas",
          overrides_ as UserOperationOverrides,
          feeOptions,
          userOp,
        ),
        ...(account.getEntryPoint().version === "0.7.0"
          ? {
              paymasterVerificationGasLimit: overrideField<"0.7.0">(
                "paymasterVerificationGasLimit",
                overrides_ as UserOperationOverrides<"0.7.0">,
                feeOptions,
                userOp,
              ),
              paymasterPostOpGasLimit: overrideField<"0.7.0">(
                "paymasterPostOpGasLimit",
                overrides_ as UserOperationOverrides<"0.7.0">,
                feeOptions,
                userOp,
              ),
            }
          : {}),
      });

      let erc20Context: RequestGasAndPaymasterAndDataRequest[0]["erc20Context"] =
        undefined;
      if (policyToken !== undefined) {
        erc20Context = {
          tokenAddress: policyToken.address,
          maxTokenAmount: policyToken.maxTokenAmount,
        };
        if (policyToken.permit !== undefined) {
          const permit = await generateSignedPermit(
            client,
            account,
            policyToken,
          );
          if (permit !== undefined) {
            erc20Context.permit = permit;
          }
        } else if (uoContext !== undefined) {
          erc20Context.permit = extractSignedPermitFromContext(uoContext);
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
            webhookData,
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
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
>(
  field: keyof UserOperationFeeOptions<TEntryPointVersion>,
  overrides: UserOperationOverrides<TEntryPointVersion> | undefined,
  feeOptions: UserOperationFeeOptions<TEntryPointVersion> | undefined,
  userOperation: UserOperationRequest<TEntryPointVersion>,
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
 * @param {MiddlewareClient} client - The Alchemy smart account client
 * @param {TAccount} account - The smart account instance
 * @param {PolicyToken} policyToken - The policy token configuration
 * @returns {Promise<Hex>} Returns a Promise containing the signed EIP2612 permit
 */
const generateSignedPermit = async <TAccount extends SmartContractAccount>(
  client: MiddlewareClient,
  account: TAccount,
  policyToken: PolicyToken,
): Promise<Hex | undefined> => {
  if (!client.chain) {
    throw new ChainNotFoundError();
  }
  if (!policyToken.permit) {
    throw new Error("permit is missing");
  }

  if (!policyToken.permit?.erc20Name || !policyToken.permit?.version) {
    throw new Error("erc20Name or version is missing");
  }

  const paymasterAddress =
    policyToken.permit.paymasterAddress ??
    getAlchemyPaymasterAddress(client.chain, account.getEntryPoint().version);

  if (paymasterAddress === undefined || paymasterAddress === "0x") {
    throw new Error("no paymaster contract address available");
  }

  let allowanceFuture = client.call({
    to: policyToken.address,
    data: encodeFunctionData({
      abi: parseAbi(ERC20Abis),
      functionName: "allowance",
      args: [account.address, paymasterAddress],
    }),
  });

  let nonceFuture = client.call({
    to: policyToken.address,
    data: encodeFunctionData({
      abi: parseAbi(EIP7597Abis),
      functionName: "nonces",
      args: [account.address],
    }),
  });

  const [allowanceResponse, nonceResponse] = await Promise.all([
    allowanceFuture,
    nonceFuture,
  ]);

  if (!allowanceResponse.data) {
    throw new Error("No allowance returned from erc20 contract call");
  }

  if (!nonceResponse.data) {
    throw new Error("No nonces returned from erc20 contract call");
  }

  const permitLimit = policyToken.permit.autoPermitApproveTo;
  const currentAllowance: bigint = BigInt(allowanceResponse.data);
  if (currentAllowance > policyToken.permit.autoPermitBelow) {
    // no need to generate permit
    return undefined;
  }

  const nonce = BigInt(nonceResponse.data);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);

  const typedPermitData = {
    types: PermitTypes,
    primaryType: "Permit" as const,
    domain: {
      name: policyToken.permit.erc20Name ?? "",
      version: policyToken.permit.version ?? "",
      chainId: BigInt(client.chain.id),
      verifyingContract: policyToken.address,
    } satisfies PermitDomain,
    message: {
      owner: account.address,
      spender: paymasterAddress,
      value: permitLimit as bigint,
      nonce: nonce,
      deadline,
    } satisfies PermitMessage,
  } as const;

  const signedPermit = await account.signTypedData(typedPermitData);
  return encodeSignedPermit(permitLimit, deadline, signedPermit);
};

function extractSignedPermitFromContext(
  context: UserOperationContext,
): Hex | undefined {
  if (context.signedPermit === undefined) {
    return undefined;
  }

  if (typeof context.signedPermit !== "object") {
    throw new InvalidSignedPermit("signedPermit is not an object");
  }
  if (typeof context.signedPermit.value !== "bigint") {
    throw new InvalidSignedPermit("signedPermit.value is not a bigint");
  }
  if (typeof context.signedPermit.deadline !== "bigint") {
    throw new InvalidSignedPermit("signedPermit.deadline is not a bigint");
  }
  if (!isHex(context.signedPermit.signature)) {
    throw new InvalidSignedPermit("signedPermit.signature is not a hex string");
  }
  return encodeSignedPermit(
    context.signedPermit.value,
    context.signedPermit.deadline,
    context.signedPermit.signature,
  );
}

function encodeSignedPermit(
  value: bigint,
  deadline: bigint,
  signedPermit: Hex,
) {
  return encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }, { type: "bytes" }],
    [value, deadline, signedPermit],
  );
}
