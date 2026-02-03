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
  PreparedCall_UserOpV060_Signed,
  PreparedCall_UserOpV070_Signed,
  PreparedCall_Authorization_Signed,
  CallArray,
  EcdsaSig,
} from "@alchemy/wallet-api-types";
import type {
  PrepareCallsCapabilities as RpcPrepareCallsCapabilities,
  SendPreparedCallsCapabilities as RpcSendPreparedCallsCapabilities,
} from "@alchemy/wallet-api-types/capabilities";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type {
  PrepareCallsResult,
  PrepareCallsResult_UserOp,
  PrepareCallsResult_Authorization,
  PrepareCallsResult_PaymasterPermit,
} from "./viemEncode.js";
// Shared types from types.ts
import type {
  Call,
  PrepareCallsCapabilities,
  SendPreparedCallsCapabilities,
  SignedUserOperation,
  SignedAuthorization,
  UserOperationV060,
  UserOperationV070,
  GasParamsOverride,
  GasMultiplier,
  PaymasterService,
  Erc20PaymasterSettings,
  StateOverride,
  Permission,
  EncodedSignature,
} from "../types.js";
// Action-specific params types from action files
import type { PrepareCallsParams } from "../actions/prepareCalls.js";
import type { PrepareSignParams } from "../actions/prepareSign.js";
import type { FormatSignParams } from "../actions/formatSign.js";
import type { GrantPermissionsParams } from "../actions/grantPermissions.js";
import type { SendPreparedCallsParams } from "../actions/sendPreparedCalls.js";
import type { RequestQuoteV0Params as RequestQuoteParams } from "../experimental/actions/requestQuoteV0.js";

// Helper type to extract RPC params for a specific method
type RpcMethodParams<M extends WalletServerRpcSchemaType["Request"]["method"]> =
  Extract<
    WalletServerRpcSchemaType,
    { Request: { method: M } }
  >["Request"]["params"][0];

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
    // Map viem's 'paymaster' to RPC's 'paymasterService'
    paymasterService:
      capabilities.paymaster != null
        ? toRpcPaymasterService(capabilities.paymaster)
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
    // Map viem's 'paymaster' to RPC's 'paymasterService'
    paymasterService:
      capabilities.paymaster != null
        ? {
            ...(capabilities.paymaster.policyId != null
              ? { policyId: capabilities.paymaster.policyId }
              : { policyIds: capabilities.paymaster.policyIds ?? [] }),
            webhookData: capabilities.paymaster.webhookData,
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

export const toRpcPrepareSignParams = (
  params: PrepareSignParams,
  defaultChainId: number,
  defaultFrom: Address,
): RpcMethodParams<"wallet_prepareSign"> => {
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

// Extract the permission type from the RPC schema
type RpcCreateSessionParams = RpcMethodParams<"wallet_createSession">;
type RpcPermission = RpcCreateSessionParams["permissions"][number];

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
): RpcCreateSessionParams => {
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

type RpcRequestQuoteParams = RpcMethodParams<"wallet_requestQuote_v0">;

export const toRpcRequestQuoteParams = (
  params: RequestQuoteParams,
  _defaultFrom: Address,
): RpcRequestQuoteParams => {
  // Build the base params
  const base = {
    from: params.sender,
    chainId: numberToHex(params.from.chainId),
    fromToken: params.from.address,
    toToken: params.to.address,
    ...(params.to.chainId != null && {
      toChainId: numberToHex(params.to.chainId),
    }),
    ...(params.slippageBps != null && {
      slippage: numberToHex(params.slippageBps),
    }),
  };

  // The RPC schema uses discriminated unions based on fromAmount/minimumToAmount/returnRawCalls
  if (params.rawCalls === true) {
    // Raw calls variant
    if (params.from.amount != null) {
      return {
        ...base,
        fromAmount: toHex(params.from.amount),
        returnRawCalls: true,
      } as RpcRequestQuoteParams;
    }
    return {
      ...base,
      minimumToAmount: toHex(params.to.minimumAmount!),
      returnRawCalls: true,
    } as RpcRequestQuoteParams;
  }

  // Prepared calls variant (default)
  if (params.from.amount != null) {
    return {
      ...base,
      fromAmount: toHex(params.from.amount),
    } as RpcRequestQuoteParams;
  }
  return {
    ...base,
    minimumToAmount: toHex(params.to.minimumAmount!),
  } as RpcRequestQuoteParams;
};

// ─────────────────────────────────────────────────────────────────────────────
// SendPreparedCalls Params Converter
// ─────────────────────────────────────────────────────────────────────────────

// Define the exact type expected by the RPC schema
type RpcSendPreparedCallsParams = (
  | CallArray
  | PreparedCall_UserOpV060_Signed
  | PreparedCall_UserOpV070_Signed
) & {
  capabilities?: RpcSendPreparedCallsCapabilities;
  callId?: Hex;
};

export const toRpcSendPreparedCallsParams = (
  params: SendPreparedCallsParams,
  defaultChainId: number,
): RpcSendPreparedCallsParams => {
  if (params.type === "array") {
    return {
      type: "array",
      data: params.data.map((item) =>
        item.type === "authorization"
          ? toRpcSignedAuthorization(item)
          : toRpcSignedUserOperation(item),
      ),
    };
  }

  const base = toRpcSignedUserOperation(params);
  return {
    ...base,
    chainId: base.chainId ?? numberToHex(defaultChainId),
    capabilities: params.capabilities
      ? toRpcSendPreparedCallsCapabilities(params.capabilities)
      : undefined,
  };
};

// RPC signature type - matches what the API expects for user operations
type RpcUserOpSignature =
  | {
      type: "secp256k1";
      data: Hex | { r: Hex; s: Hex; yParity: Hex } | { r: Hex; s: Hex; v: Hex };
    }
  | {
      type: "ecdsa";
      data: Hex | { r: Hex; s: Hex; yParity: Hex } | { r: Hex; s: Hex; v: Hex };
    };

const toRpcUserOpSignature = (sig: EncodedSignature): RpcUserOpSignature => {
  if (typeof sig.data === "string") {
    return { type: sig.type, data: sig.data };
  }
  if ("yParity" in sig.data) {
    return {
      type: sig.type,
      data: {
        r: sig.data.r,
        s: sig.data.s,
        yParity: numberToHex(sig.data.yParity),
      },
    };
  }
  return {
    type: sig.type,
    data: { r: sig.data.r, s: sig.data.s, v: toHex(sig.data.v) },
  };
};

const toRpcSignedUserOperation = (
  op: SignedUserOperation,
): PreparedCall_UserOpV060_Signed | PreparedCall_UserOpV070_Signed => {
  if (op.type === "user-operation-v070") {
    return {
      type: "user-operation-v070",
      chainId: numberToHex(op.chainId),
      data: toRpcUserOperationDataV070(op.data as UserOperationV070),
      signature: toRpcUserOpSignature(op.signature),
    };
  }
  return {
    type: "user-operation-v060",
    chainId: numberToHex(op.chainId),
    data: toRpcUserOperationDataV060(op.data as UserOperationV060),
    signature: toRpcUserOpSignature(op.signature),
  };
};

const toRpcSignedAuthorization = (
  auth: SignedAuthorization,
): PreparedCall_Authorization_Signed => {
  return {
    type: "authorization",
    chainId: numberToHex(auth.chainId),
    data: {
      address: auth.data.address,
      nonce: numberToHex(auth.data.nonce),
    },
    signature: toRpcUserOpSignature(auth.signature),
  };
};

const toRpcUserOperationDataV060 = (uo: UserOperationV060) => {
  return {
    sender: uo.sender,
    nonce: toHex(uo.nonce),
    initCode: uo.initCode ?? ("0x" as Hex),
    callData: uo.callData,
    callGasLimit: toHex(uo.callGasLimit),
    verificationGasLimit: toHex(uo.verificationGasLimit),
    preVerificationGas: toHex(uo.preVerificationGas),
    maxFeePerGas: toHex(uo.maxFeePerGas),
    maxPriorityFeePerGas: toHex(uo.maxPriorityFeePerGas),
    paymasterAndData: uo.paymasterAndData ?? ("0x" as Hex),
  };
};

const toRpcUserOperationDataV070 = (uo: UserOperationV070) => {
  return {
    sender: uo.sender,
    nonce: toHex(uo.nonce),
    factory: uo.factory,
    factoryData: uo.factoryData,
    callData: uo.callData,
    callGasLimit: toHex(uo.callGasLimit),
    verificationGasLimit: toHex(uo.verificationGasLimit),
    preVerificationGas: toHex(uo.preVerificationGas),
    maxFeePerGas: toHex(uo.maxFeePerGas),
    maxPriorityFeePerGas: toHex(uo.maxPriorityFeePerGas),
    paymaster: uo.paymaster,
    paymasterData: uo.paymasterData,
    paymasterVerificationGasLimit:
      uo.paymasterVerificationGasLimit != null
        ? toHex(uo.paymasterVerificationGasLimit)
        : undefined,
    paymasterPostOpGasLimit:
      uo.paymasterPostOpGasLimit != null
        ? toHex(uo.paymasterPostOpGasLimit)
        : undefined,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PrepareCallsResult → RPC Converter (for round-trip testing)
// ─────────────────────────────────────────────────────────────────────────────

export const toRpcPrepareCallsResult = (
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

// Return type is looser than RPC type because viem has tokenAddress as optional.
// The parent function casts to RpcPrepareCallsResult which handles the mismatch.
const toRpcUserOperationCall = (call: PrepareCallsResult_UserOp) => {
  const feePayment = {
    sponsored: call.feePayment.sponsored,
    maxAmount: toHex(call.feePayment.maxAmount),
    tokenAddress: call.feePayment.tokenAddress,
  };

  if (call.type === "user-operation-v070") {
    return {
      type: "user-operation-v070" as const,
      chainId: numberToHex(call.chainId),
      data: toRpcUserOperationDataV070(call.data as UserOperationV070),
      signatureRequest: call.signatureRequest,
      feePayment,
    };
  }
  return {
    type: "user-operation-v060" as const,
    chainId: numberToHex(call.chainId),
    data: {
      ...toRpcUserOperationDataV060(call.data as UserOperationV060),
      paymasterAndData: "0x" as Hex,
    },
    signatureRequest: call.signatureRequest,
    feePayment,
  };
};

const toRpcAuthorizationCall = (call: PrepareCallsResult_Authorization) => {
  return {
    type: "authorization" as const,
    chainId: numberToHex(call.chainId),
    data: {
      address: call.data.address,
      nonce: numberToHex(call.data.nonce),
    },
    signatureRequest: call.signatureRequest,
  };
};

const toRpcPaymasterPermitCall = (call: PrepareCallsResult_PaymasterPermit) => {
  return {
    type: "paymaster-permit" as const,
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
        ? toRpcPermitSignature(call.modifiedRequest.paymasterPermitSignature)
        : undefined,
    },
  };
};

const toRpcPermitSignature = (
  signature: NonNullable<
    PrepareCallsResult_PaymasterPermit["modifiedRequest"]["paymasterPermitSignature"]
  >,
): EcdsaSig["signature"] => {
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
  return {
    type: signature.type,
    data: {
      r: signature.data.r,
      s: signature.data.s,
      v: toHex(signature.data.v),
    },
  };
};
