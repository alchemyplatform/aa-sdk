/**
 * Converts viem-native types to RPC hex format for API requests.
 * These functions are used to convert user-provided params to API format.
 *
 * IMPORTANT: All fields are explicit - no spreading to avoid passing unknown fields.
 * If the user provides an unknown field, it won't be sent to the API.
 */

import { numberToHex, toHex, type Address, type Hex } from "viem";
import type {
  PrepareCallsParams as RpcPrepareCallsParams,
  PrepareCallsReturnType as RpcPrepareCallsResult,
} from "@alchemy/wallet-api-types";
import type {
  PrepareCallsCapabilities as RpcPrepareCallsCapabilities,
  SendPreparedCallsCapabilities as RpcSendPreparedCallsCapabilities,
} from "@alchemy/wallet-api-types/capabilities";
import type {
  PrepareCallsResult,
  PrepareCallsResult_UserOp,
  PrepareCallsResult_Authorization,
  PrepareCallsResult_PaymasterPermit,
} from "./viemEncode.js";
import type {
  Call,
  PrepareCallsCapabilities,
  PrepareCallsParams,
  SendPreparedCallsCapabilities,
  GasParamsOverride,
  GasMultiplier,
  PaymasterService,
  Erc20PaymasterSettings,
  StateOverride,
  PrepareSignParams,
  FormatSignParams,
  GrantPermissionsParams,
  Permission,
  RequestQuoteParams,
} from "./viemTypes.js";

// ─────────────────────────────────────────────────────────────────────────────
// Main Converters
// ─────────────────────────────────────────────────────────────────────────────

export const toRpcPrepareCallsParams = (
  params: PrepareCallsParams,
  defaultChainId: number,
  defaultFrom: Address,
): RpcPrepareCallsParams => {
  return {
    from: params.from ?? defaultFrom,
    chainId: numberToHex(params.chainId ?? defaultChainId),
    calls: params.calls.map((call) => toRpcCall(call)),
    capabilities:
      params.capabilities != null
        ? toRpcPrepareCallsCapabilities(params.capabilities)
        : undefined,
    paymasterPermitSignature: params.paymasterPermitSignature,
  };
};

export const toRpcPrepareCallsCapabilities = (
  capabilities: PrepareCallsCapabilities,
): RpcPrepareCallsCapabilities => {
  return {
    permissions: capabilities.permissions,
    paymasterService:
      capabilities.paymasterService != null
        ? toRpcPaymasterService(capabilities.paymasterService)
        : undefined,
    gasParamsOverride:
      capabilities.gasParamsOverride != null
        ? toRpcGasParamsOverride(capabilities.gasParamsOverride)
        : undefined,
    eip7702Auth: capabilities.eip7702Auth,
    nonceOverride:
      capabilities.nonceOverride != null
        ? { nonceKey: toHex(capabilities.nonceOverride.nonceKey) }
        : undefined,
    stateOverride:
      capabilities.stateOverride != null
        ? toRpcStateOverride(capabilities.stateOverride)
        : undefined,
  };
};

export const toRpcSendPreparedCallsCapabilities = (
  capabilities: SendPreparedCallsCapabilities,
): RpcSendPreparedCallsCapabilities => {
  return {
    permissions: capabilities.permissions,
    paymasterService:
      capabilities.paymasterService != null
        ? {
            ...(capabilities.paymasterService.policyId != null
              ? { policyId: capabilities.paymasterService.policyId }
              : { policyIds: capabilities.paymasterService.policyIds ?? [] }),
            webhookData: capabilities.paymasterService.webhookData,
          }
        : undefined,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Converters
// ─────────────────────────────────────────────────────────────────────────────

const toRpcCall = (call: Call): { to: Address; data?: Hex; value?: Hex } => {
  return {
    to: call.to,
    data: call.data,
    value: call.value != null ? toHex(call.value) : undefined,
  };
};

const toRpcGasParamsOverride = (
  override: GasParamsOverride,
): RpcPrepareCallsCapabilities["gasParamsOverride"] => {
  const convertValue = (
    value: bigint | GasMultiplier | undefined,
  ): Hex | { multiplier: number } | undefined => {
    if (value == null) return undefined;
    if (typeof value === "bigint") return toHex(value);
    return value; // Multiplier passes through
  };

  return {
    preVerificationGas: convertValue(override.preVerificationGas),
    verificationGasLimit: convertValue(override.verificationGasLimit),
    callGasLimit: convertValue(override.callGasLimit),
    paymasterVerificationGasLimit: convertValue(
      override.paymasterVerificationGasLimit,
    ),
    paymasterPostOpGasLimit: convertValue(override.paymasterPostOpGasLimit),
    maxFeePerGas: convertValue(override.maxFeePerGas),
    maxPriorityFeePerGas: convertValue(override.maxPriorityFeePerGas),
  };
};

const toRpcPaymasterService = (
  paymaster: PaymasterService,
): NonNullable<RpcPrepareCallsCapabilities["paymasterService"]> => {
  // Build the base with policy ID(s)
  const base: NonNullable<RpcPrepareCallsCapabilities["paymasterService"]> =
    paymaster.policyId != null
      ? { policyId: paymaster.policyId }
      : { policyIds: paymaster.policyIds ?? [] };

  return {
    ...base,
    onlyEstimation: paymaster.onlyEstimation,
    webhookData: paymaster.webhookData,
    erc20:
      paymaster.erc20 != null
        ? toRpcErc20PaymasterSettings(paymaster.erc20)
        : undefined,
  };
};

const toRpcErc20PaymasterSettings = (
  erc20: Erc20PaymasterSettings,
): NonNullable<
  NonNullable<RpcPrepareCallsCapabilities["paymasterService"]>["erc20"]
> => {
  const base = {
    tokenAddress: erc20.tokenAddress,
    maxTokenAmount:
      erc20.maxTokenAmount != null ? toHex(erc20.maxTokenAmount) : undefined,
  };

  if ("preOpSettings" in erc20 && erc20.preOpSettings != null) {
    const preOp = erc20.preOpSettings;
    if ("autoPermit" in preOp && preOp.autoPermit != null) {
      return {
        ...base,
        preOpSettings: {
          autoPermit: {
            below: toHex(preOp.autoPermit.below),
            amount: toHex(preOp.autoPermit.amount),
            durationSeconds:
              preOp.autoPermit.durationSeconds != null
                ? numberToHex(preOp.autoPermit.durationSeconds)
                : undefined,
          },
        },
      };
    }
    if ("permitDetails" in preOp && preOp.permitDetails != null) {
      return {
        ...base,
        preOpSettings: {
          permitDetails: {
            deadline: numberToHex(preOp.permitDetails.deadline),
            value: toHex(preOp.permitDetails.value),
          },
        },
      };
    }
  }

  if ("postOpSettings" in erc20 && erc20.postOpSettings != null) {
    const postOp = erc20.postOpSettings;
    if (postOp.autoApprove != null) {
      // Build autoApprove conditionally - amount is optional in viem types
      // but RPC expects it only when provided
      const autoApprove =
        postOp.autoApprove.amount != null
          ? {
              below: toHex(postOp.autoApprove.below),
              amount: toHex(postOp.autoApprove.amount),
            }
          : { below: toHex(postOp.autoApprove.below) };
      return {
        ...base,
        postOpSettings: { autoApprove },
      } as ReturnType<typeof toRpcErc20PaymasterSettings>;
    }
    return {
      ...base,
      postOpSettings: {},
    };
  }

  // No preOpSettings or postOpSettings - manual approvals
  return base;
};

const toRpcStateOverride = (
  stateOverride: StateOverride,
): RpcPrepareCallsCapabilities["stateOverride"] => {
  const result: RpcPrepareCallsCapabilities["stateOverride"] = {};
  for (const [address, override] of Object.entries(stateOverride)) {
    result![address as Address] = {
      balance: override.balance != null ? toHex(override.balance) : undefined,
      nonce: override.nonce != null ? toHex(override.nonce) : undefined,
      code: override.code,
      state: override.state,
      stateDiff: override.stateDiff,
    };
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// PrepareSign Params Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcPrepareSignParams = {
  from: Address;
  chainId: Hex;
  signatureRequest:
    | { type: "personal_sign"; data: string | { raw: Hex } }
    | { type: "eth_signTypedData_v4"; data: unknown };
  capabilities?: {
    permissions: { context: Hex } | { signature: Hex; sessionId: Hex };
  };
};

export const toRpcPrepareSignParams = (
  params: PrepareSignParams,
  defaultChainId: number,
  defaultFrom: Address,
): RpcPrepareSignParams => {
  return {
    from: params.from ?? defaultFrom,
    chainId: numberToHex(params.chainId ?? defaultChainId),
    signatureRequest: params.signatureRequest,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FormatSign Params Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcFormatSignParams = {
  from: Address;
  chainId: Hex;
  signature: {
    type: "ecdsa";
    data: Hex;
  };
  capabilities?: {
    permissions: { context: Hex } | { signature: Hex; sessionId: Hex };
  };
};

export const toRpcFormatSignParams = (
  params: FormatSignParams,
  defaultChainId: number,
  defaultFrom: Address,
): RpcFormatSignParams => {
  return {
    from: params.from ?? defaultFrom,
    chainId: numberToHex(params.chainId ?? defaultChainId),
    signature: params.signature,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GrantPermissions (createSession) Params Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcPermission =
  | { type: "native-token-transfer"; data: { allowance: Hex } }
  | { type: "erc20-token-transfer"; data: { allowance: Hex; address: Address } }
  | { type: "gas-limit"; data: { limit: Hex } }
  | { type: "contract-access"; data: { address: Address } }
  | { type: "account-functions"; data: { functions: Hex[] } }
  | { type: "functions-on-all-contracts"; data: { functions: Hex[] } }
  | {
      type: "functions-on-contract";
      data: { address: Address; functions: Hex[] };
    }
  | { type: "root" };

type RpcGrantPermissionsParams = {
  account: Address;
  chainId: Hex;
  expirySec?: number;
  key: {
    publicKey: Hex;
    type: "secp256k1" | "ecdsa" | "contract";
  };
  permissions: RpcPermission[];
};

const toRpcPermission = (permission: Permission): RpcPermission => {
  switch (permission.type) {
    case "native-token-transfer":
      return {
        type: permission.type,
        data: { allowance: toHex(permission.data.allowance) },
      };
    case "erc20-token-transfer":
      return {
        type: permission.type,
        data: {
          allowance: toHex(permission.data.allowance),
          address: permission.data.address,
        },
      };
    case "gas-limit":
      return {
        type: permission.type,
        data: { limit: toHex(permission.data.limit) },
      };
    case "contract-access":
    case "account-functions":
    case "functions-on-all-contracts":
    case "functions-on-contract":
      return permission;
    case "root":
      return { type: "root" };
    default:
      return permission as RpcPermission;
  }
};

export const toRpcGrantPermissionsParams = (
  params: GrantPermissionsParams,
  defaultChainId: number,
  defaultAccount: Address,
): RpcGrantPermissionsParams => {
  return {
    account: params.account ?? defaultAccount,
    chainId: numberToHex(params.chainId ?? defaultChainId),
    expirySec: params.expirySec,
    key: {
      publicKey: params.key.publicKey,
      // Map p256 to ecdsa for RPC compatibility
      type: params.key.type === "p256" ? "ecdsa" : params.key.type,
    },
    permissions: params.permissions.map(toRpcPermission),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RequestQuote Params Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcRequestQuoteParams = {
  from: Address;
  chainId: Hex;
  fromToken: Address;
  toToken: Address;
  toChainId?: Hex;
  fromAmount?: Hex;
  minimumToAmount?: Hex;
  slippage?: Hex;
  postCalls?: Array<{ to: Address; data?: Hex; value?: Hex }>;
  returnRawCalls?: boolean;
  capabilities?: RpcPrepareCallsCapabilities;
};

export const toRpcRequestQuoteParams = (
  params: RequestQuoteParams,
  _defaultFrom: Address,
): RpcRequestQuoteParams => {
  const result: RpcRequestQuoteParams = {
    from: params.sender,
    chainId: numberToHex(params.from.chainId),
    fromToken: params.from.address,
    toToken: params.to.address,
    returnRawCalls: params.rawCalls,
  };

  if (params.from.amount != null) {
    result.fromAmount = toHex(params.from.amount);
  }

  if (params.to.minimumAmount != null) {
    result.minimumToAmount = toHex(params.to.minimumAmount);
  }

  if (params.to.chainId != null) {
    result.toChainId = numberToHex(params.to.chainId);
  }

  if (params.slippageBps != null) {
    result.slippage = numberToHex(params.slippageBps);
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy export for round-trip testing
// ─────────────────────────────────────────────────────────────────────────────

// @deprecated For testing only - converts viem-native prepared calls back to RPC format
export const viemDecodePreparedCall = (
  viemResult: PrepareCallsResult,
): RpcPrepareCallsResult => {
  if (viemResult.type === "array") {
    return {
      type: "array",
      data: viemResult.data.map((item) => {
        if (item.type === "authorization") {
          return toRpcAuthorizationCall(item);
        }
        return toRpcUserOperationCall(item);
      }),
    } as RpcPrepareCallsResult;
  }

  if (viemResult.type === "paymaster-permit") {
    return toRpcPaymasterPermitCall(viemResult) as RpcPrepareCallsResult;
  }

  return toRpcUserOperationCall(viemResult) as RpcPrepareCallsResult;
};

const toRpcUserOperationCall = (
  call: PrepareCallsResult_UserOp,
): Record<string, unknown> => {
  // Cast to access version-specific fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callData = call.data as any;
  const data =
    call.type === "user-operation-v070"
      ? {
          sender: callData.sender,
          nonce: toHex(callData.nonce),
          factory: callData.factory,
          factoryData: callData.factoryData,
          callData: callData.callData,
          callGasLimit: toHex(callData.callGasLimit),
          verificationGasLimit: toHex(callData.verificationGasLimit),
          preVerificationGas: toHex(callData.preVerificationGas),
          maxFeePerGas: toHex(callData.maxFeePerGas),
          maxPriorityFeePerGas: toHex(callData.maxPriorityFeePerGas),
          paymaster: callData.paymaster,
          paymasterData: callData.paymasterData,
          paymasterVerificationGasLimit:
            callData.paymasterVerificationGasLimit != null
              ? toHex(callData.paymasterVerificationGasLimit)
              : undefined,
          paymasterPostOpGasLimit:
            callData.paymasterPostOpGasLimit != null
              ? toHex(callData.paymasterPostOpGasLimit)
              : undefined,
        }
      : {
          sender: callData.sender,
          nonce: toHex(callData.nonce),
          initCode: callData.initCode,
          callData: callData.callData,
          callGasLimit: toHex(callData.callGasLimit),
          verificationGasLimit: toHex(callData.verificationGasLimit),
          preVerificationGas: toHex(callData.preVerificationGas),
          maxFeePerGas: toHex(callData.maxFeePerGas),
          maxPriorityFeePerGas: toHex(callData.maxPriorityFeePerGas),
          paymasterAndData: "0x",
        };

  return {
    type: call.type,
    chainId: numberToHex(call.chainId),
    data,
    signatureRequest: call.signatureRequest,
    feePayment: {
      sponsored: call.feePayment.sponsored,
      tokenAddress: call.feePayment.tokenAddress,
      maxAmount: toHex(call.feePayment.maxAmount),
    },
  };
};

const toRpcAuthorizationCall = (
  call: PrepareCallsResult_Authorization,
): Record<string, unknown> => {
  return {
    type: call.type,
    chainId: numberToHex(call.chainId),
    data: {
      address: call.data.address,
      nonce: numberToHex(call.data.nonce),
    },
    signatureRequest: call.signatureRequest,
  };
};

const toRpcPaymasterPermitCall = (
  call: PrepareCallsResult_PaymasterPermit,
): Record<string, unknown> => {
  return {
    type: call.type,
    data: call.data,
    signatureRequest: call.signatureRequest,
    modifiedRequest: {
      from: call.modifiedRequest.from,
      chainId: numberToHex(call.modifiedRequest.chainId),
      calls: call.modifiedRequest.calls.map((c) => ({
        to: c.to,
        data: c.data,
        value: c.value != null ? toHex(c.value) : undefined,
      })),
      capabilities: call.modifiedRequest.capabilities
        ? toRpcPrepareCallsCapabilities(call.modifiedRequest.capabilities)
        : undefined,
      paymasterPermitSignature: call.modifiedRequest.paymasterPermitSignature
        ? toRpcSignature(call.modifiedRequest.paymasterPermitSignature)
        : undefined,
    },
  };
};

const toRpcSignature = (
  signature: NonNullable<
    PrepareCallsResult_PaymasterPermit["modifiedRequest"]["paymasterPermitSignature"]
  >,
): Record<string, unknown> => {
  if (typeof signature.data === "string") {
    return { type: signature.type, data: signature.data };
  }
  if ("yParity" in signature.data && signature.data.yParity != null) {
    return {
      type: signature.type,
      data: {
        r: signature.data.r,
        s: signature.data.s,
        yParity: numberToHex(signature.data.yParity),
      },
    };
  }
  if ("v" in signature.data) {
    return {
      type: signature.type,
      data: {
        r: signature.data.r,
        s: signature.data.s,
        v: toHex(signature.data.v),
      },
    };
  }
  return signature as Record<string, unknown>;
};
