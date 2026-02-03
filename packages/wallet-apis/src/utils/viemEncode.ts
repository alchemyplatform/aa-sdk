/**
 * Converts RPC response types (hex strings) to viem-native types (bigint, number).
 * These functions are used to convert API responses to user-friendly formats.
 *
 * IMPORTANT: All fields are explicit - no spreading to avoid passing unknown fields.
 * If the API adds a new field, it won't appear in the SDK output until explicitly handled.
 */

import {
  hexToBigInt,
  hexToNumber,
  type Address,
  type Hex,
  type Signature,
} from "viem";
import { assertNever } from "@alchemy/common";
import type { UserOperation } from "viem/account-abstraction";
import type {
  EcdsaSig,
  PreparedCall_Authorization,
  PreparedCall_Permit,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
  PrepareCallsReturnType as RpcPrepareCallsResult,
} from "@alchemy/wallet-api-types";
import type { PrepareCallsCapabilities as RpcPrepareCallsCapabilities } from "@alchemy/wallet-api-types/capabilities";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
// Shared types from types.ts
import type {
  GetCallsStatusResult,
  PrepareCallsCapabilities,
  Erc20PaymasterSettings,
  StateOverride,
  SignableMessage,
  TypedData,
} from "../types.js";
// Action-specific result types from action files
import type { PrepareSignResult } from "../actions/prepareSign.js";
import type { FormatSignResult } from "../actions/formatSign.js";
import type { SendPreparedCallsResult } from "../actions/sendPreparedCalls.js";
import type {
  RequestQuoteV0Result as RequestQuoteResult,
  RequestQuoteV0Result_PreparedCalls as RequestQuoteResult_PreparedCalls,
  RequestQuoteV0Result_RawCalls as RequestQuoteResult_RawCalls,
} from "../experimental/actions/requestQuoteV0.js";

// Note: GrantPermissionsResult has a different shape in grantPermissions.ts (just {context})
// The viemEncode.ts fromRpcCreateSessionResult returns a different internal type
// that includes sessionId and signatureRequest for internal use
type GrantPermissionsResult = {
  sessionId: Hex;
  chainId: number;
  signatureRequest: {
    type: "eth_signTypedData_v4";
    data: TypedData;
  };
};

// Helper type to extract RPC return type for a specific method
type RpcMethodReturn<M extends WalletServerRpcSchemaType["Request"]["method"]> =
  Extract<WalletServerRpcSchemaType, { Request: { method: M } }>["ReturnType"];

// ─────────────────────────────────────────────────────────────────────────────
// Result Types (viem-native)
// ─────────────────────────────────────────────────────────────────────────────

export type PrepareCallsResult =
  | PrepareCallsResult_UserOp
  | PrepareCallsResult_PaymasterPermit
  | PrepareCallsResult_Array;

export type PrepareCallsResult_Array = {
  type: "array";
  data: (PrepareCallsResult_UserOp | PrepareCallsResult_Authorization)[];
  details?: PrepareCallsDetails;
};

export type PrepareCallsResult_UserOp = {
  type: "user-operation-v070" | "user-operation-v060";
  chainId: number;
  data:
    | Omit<UserOperation<"0.6">, "signature">
    | Omit<UserOperation<"0.7">, "signature">;
  signatureRequest: PreparedCall_UserOpV070["signatureRequest"];
  feePayment: {
    sponsored: boolean;
    tokenAddress?: Address;
    maxAmount: bigint;
  };
  details?: PrepareCallsDetails;
};

export type PrepareCallsResult_Authorization = {
  type: "authorization";
  chainId: number;
  data: {
    address: Address;
    nonce: number;
  };
  signatureRequest: PreparedCall_Authorization["signatureRequest"];
};

export type PrepareCallsResult_PaymasterPermit = {
  type: "paymaster-permit";
  data: PreparedCall_Permit["data"]; // TypedDataDefinition - no conversion needed
  signatureRequest: PreparedCall_Permit["signatureRequest"];
  modifiedRequest: {
    from: Address;
    paymasterPermitSignature: EncodedSignature | undefined;
    calls: { to: Address; data?: Hex; value?: bigint }[];
    capabilities?: PrepareCallsCapabilities;
    chainId: number;
  };
  details?: PrepareCallsDetails;
};

export type PrepareCallsDetails = {
  type: "user-operation";
  data: {
    hash: Hex;
    calls: { to: Address; data?: Hex; value?: bigint }[];
  };
};

// PrepareCallsCapabilities, Erc20PaymasterSettings, and StateOverride are imported from viemTypes.js

type EncodedSignature = {
  type: EcdsaSig["signature"]["type"];
  data: Signature | Hex;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Converter
// ─────────────────────────────────────────────────────────────────────────────

export const fromRpcPrepareCallsResult = (
  rpcResult: RpcPrepareCallsResult,
): PrepareCallsResult => {
  const details = fromRpcDetails(rpcResult.details);

  if (rpcResult.type === "array") {
    return {
      type: "array",
      data: rpcResult.data.map((call) => {
        switch (call.type) {
          case "user-operation-v060":
          case "user-operation-v070":
            return fromRpcUserOperationCall(call);
          case "authorization":
            return fromRpcAuthorizationCall(call);
          default:
            return assertNever(call, "Unexpected prepared call type in array");
        }
      }),
      details,
    };
  }

  switch (rpcResult.type) {
    case "user-operation-v060":
    case "user-operation-v070":
      return {
        ...fromRpcUserOperationCall(rpcResult),
        details,
      };
    case "paymaster-permit":
      return {
        ...fromRpcPaymasterPermitCall(rpcResult),
        details,
      };
    default:
      return assertNever(rpcResult, "Unexpected prepared call type");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// User Operation Converters
// ─────────────────────────────────────────────────────────────────────────────

const fromRpcUserOperationCall = (
  call: PreparedCall_UserOpV060 | PreparedCall_UserOpV070,
): PrepareCallsResult_UserOp => {
  return {
    type: call.type,
    chainId: hexToNumber(call.chainId),
    data:
      call.type === "user-operation-v070"
        ? fromRpcUoData070(call.data)
        : fromRpcUoData060(call.data),
    signatureRequest: call.signatureRequest,
    feePayment: {
      sponsored: call.feePayment.sponsored,
      tokenAddress: call.feePayment.tokenAddress,
      maxAmount: hexToBigInt(call.feePayment.maxAmount),
    },
  };
};

const fromRpcUoData060 = (
  uo: PreparedCall_UserOpV060["data"],
): Omit<UserOperation<"0.6">, "signature"> => {
  return {
    sender: uo.sender,
    nonce: hexToBigInt(uo.nonce),
    initCode: uo.initCode,
    callData: uo.callData,
    callGasLimit: hexToBigInt(uo.callGasLimit),
    verificationGasLimit: hexToBigInt(uo.verificationGasLimit),
    preVerificationGas: hexToBigInt(uo.preVerificationGas),
    maxFeePerGas: hexToBigInt(uo.maxFeePerGas),
    maxPriorityFeePerGas: hexToBigInt(uo.maxPriorityFeePerGas),
  };
};

const fromRpcUoData070 = (
  uo: PreparedCall_UserOpV070["data"],
): Omit<UserOperation<"0.7">, "signature"> => {
  return {
    sender: uo.sender,
    nonce: hexToBigInt(uo.nonce),
    factory: uo.factory,
    factoryData: uo.factoryData,
    callData: uo.callData,
    callGasLimit: hexToBigInt(uo.callGasLimit),
    verificationGasLimit: hexToBigInt(uo.verificationGasLimit),
    preVerificationGas: hexToBigInt(uo.preVerificationGas),
    maxFeePerGas: hexToBigInt(uo.maxFeePerGas),
    maxPriorityFeePerGas: hexToBigInt(uo.maxPriorityFeePerGas),
    paymaster: uo.paymaster,
    paymasterData: uo.paymasterData,
    paymasterVerificationGasLimit:
      uo.paymasterVerificationGasLimit != null
        ? hexToBigInt(uo.paymasterVerificationGasLimit)
        : undefined,
    paymasterPostOpGasLimit:
      uo.paymasterPostOpGasLimit != null
        ? hexToBigInt(uo.paymasterPostOpGasLimit)
        : undefined,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Authorization Converter
// ─────────────────────────────────────────────────────────────────────────────

const fromRpcAuthorizationCall = (
  call: PreparedCall_Authorization,
): PrepareCallsResult_Authorization => {
  return {
    type: call.type,
    chainId: hexToNumber(call.chainId),
    data: {
      address: call.data.address,
      nonce: hexToNumber(call.data.nonce),
    },
    signatureRequest: call.signatureRequest,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Paymaster Permit Converter
// ─────────────────────────────────────────────────────────────────────────────

const fromRpcPaymasterPermitCall = (
  call: PreparedCall_Permit,
): Omit<PrepareCallsResult_PaymasterPermit, "details"> => {
  return {
    type: call.type,
    data: call.data,
    signatureRequest: call.signatureRequest,
    modifiedRequest: {
      from: call.modifiedRequest.from,
      paymasterPermitSignature: fromRpcSignature(
        call.modifiedRequest.paymasterPermitSignature,
      ),
      calls: call.modifiedRequest.calls.map((it) => ({
        to: it.to,
        data: it.data,
        value: it.value != null ? hexToBigInt(it.value) : undefined,
      })),
      capabilities: call.modifiedRequest.capabilities
        ? fromRpcCapabilities(call.modifiedRequest.capabilities)
        : undefined,
      chainId: hexToNumber(call.modifiedRequest.chainId),
    },
  };
};

const fromRpcSignature = (
  signature: EcdsaSig["signature"] | undefined,
): EncodedSignature | undefined => {
  if (!signature) {
    return undefined;
  }
  const { type, data } = signature;
  if (typeof data === "string") {
    return { type, data };
  }
  if ("yParity" in data) {
    return {
      type,
      data: {
        r: data.r,
        s: data.s,
        yParity: Number(data.yParity),
      },
    };
  }
  if ("v" in data) {
    return {
      type,
      data: {
        r: data.r,
        s: data.s,
        v: hexToBigInt(data.v),
      },
    };
  }
  return assertNever(data, "Signature object must include 'v' or 'yParity'");
};

// ─────────────────────────────────────────────────────────────────────────────
// Details Converter
// ─────────────────────────────────────────────────────────────────────────────

const fromRpcDetails = (
  details: RpcPrepareCallsResult["details"],
): PrepareCallsDetails | undefined => {
  if (!details) {
    return undefined;
  }
  return {
    type: details.type,
    data: {
      hash: details.data.hash,
      calls: details.data.calls.map((call) => ({
        to: call.to,
        data: call.data,
        value: call.value != null ? hexToBigInt(call.value) : undefined,
      })),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Capabilities Converter (for paymaster permit modifiedRequest)
// ─────────────────────────────────────────────────────────────────────────────

const fromRpcCapabilities = (
  capabilities: RpcPrepareCallsCapabilities,
): PrepareCallsCapabilities => {
  // Convert RPC permissions to viem format
  // RPC can have { context } or { sessionId, signature }, viem only has { context }
  let permissions: PrepareCallsCapabilities["permissions"];
  if (capabilities.permissions != null) {
    if ("context" in capabilities.permissions) {
      permissions = { context: capabilities.permissions.context };
    }
    // If sessionId/signature format, we can't convert without additional logic
    // This is typically used internally and not exposed to users
  }

  return {
    permissions,
    // Map RPC's 'paymasterService' to viem's 'paymaster'
    paymaster: capabilities.paymasterService
      ? fromRpcPaymasterService(capabilities.paymasterService)
      : undefined,
    gasParamsOverride: capabilities.gasParamsOverride
      ? fromRpcGasParamsOverride(capabilities.gasParamsOverride)
      : undefined,
    eip7702Auth: capabilities.eip7702Auth,
    nonceOverride: capabilities.nonceOverride
      ? { nonceKey: hexToBigInt(capabilities.nonceOverride.nonceKey) }
      : undefined,
    stateOverride: capabilities.stateOverride
      ? fromRpcStateOverride(capabilities.stateOverride)
      : undefined,
  };
};

const fromRpcGasParamsOverride = (
  override: NonNullable<RpcPrepareCallsCapabilities["gasParamsOverride"]>,
): PrepareCallsCapabilities["gasParamsOverride"] => {
  const convertValue = (
    value: Hex | { multiplier: number } | undefined,
  ): bigint | { multiplier: number } | undefined => {
    if (value == null) return undefined;
    if (typeof value === "string") return hexToBigInt(value);
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

const fromRpcPaymasterService = (
  paymaster: NonNullable<RpcPrepareCallsCapabilities["paymasterService"]>,
): NonNullable<PrepareCallsCapabilities["paymaster"]> => {
  return {
    policyId: "policyId" in paymaster ? paymaster.policyId : undefined,
    policyIds: "policyIds" in paymaster ? paymaster.policyIds : undefined,
    onlyEstimation: paymaster.onlyEstimation,
    webhookData: paymaster.webhookData,
    erc20: paymaster.erc20 ? fromRpcErc20Settings(paymaster.erc20) : undefined,
  };
};

const fromRpcErc20Settings = (
  erc20: NonNullable<
    NonNullable<RpcPrepareCallsCapabilities["paymasterService"]>["erc20"]
  >,
): Erc20PaymasterSettings => {
  const base: Erc20PaymasterSettings = {
    tokenAddress: erc20.tokenAddress,
    maxTokenAmount:
      erc20.maxTokenAmount != null
        ? hexToBigInt(erc20.maxTokenAmount)
        : undefined,
  };

  if ("preOpSettings" in erc20 && erc20.preOpSettings) {
    const preOp = erc20.preOpSettings;
    if ("autoPermit" in preOp && preOp.autoPermit) {
      return {
        ...base,
        preOpSettings: {
          autoPermit: {
            below: hexToBigInt(preOp.autoPermit.below),
            amount: hexToBigInt(preOp.autoPermit.amount),
            durationSeconds:
              preOp.autoPermit.durationSeconds != null
                ? hexToNumber(preOp.autoPermit.durationSeconds)
                : undefined,
          },
        },
      };
    }
    if ("permitDetails" in preOp && preOp.permitDetails) {
      return {
        ...base,
        preOpSettings: {
          permitDetails: {
            deadline: hexToNumber(preOp.permitDetails.deadline),
            value: hexToBigInt(preOp.permitDetails.value),
          },
        },
      };
    }
  }

  if ("postOpSettings" in erc20 && erc20.postOpSettings) {
    const postOp = erc20.postOpSettings;
    return {
      ...base,
      postOpSettings: postOp.autoApprove
        ? {
            autoApprove: {
              below: hexToBigInt(postOp.autoApprove.below),
              amount:
                postOp.autoApprove.amount != null
                  ? hexToBigInt(postOp.autoApprove.amount)
                  : undefined,
            },
          }
        : undefined,
    };
  }

  return base;
};

const fromRpcStateOverride = (
  stateOverride: NonNullable<RpcPrepareCallsCapabilities["stateOverride"]>,
): StateOverride => {
  const result: StateOverride = {};
  for (const [address, override] of Object.entries(stateOverride)) {
    // RPC type uses a union: { state } | { stateDiff }, need to check which exists
    const entry: StateOverride[Address] = {
      balance:
        override.balance != null ? hexToBigInt(override.balance) : undefined,
      nonce: override.nonce != null ? hexToBigInt(override.nonce) : undefined,
      code: override.code,
    };
    if ("state" in override && override.state != null) {
      entry.state = override.state as { [slot: Hex]: Hex };
    }
    if ("stateDiff" in override && override.stateDiff != null) {
      entry.stateDiff = override.stateDiff as { [slot: Hex]: Hex };
    }
    result[address as Address] = entry;
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// SendPreparedCalls Result Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcSendPreparedCallsResult = RpcMethodReturn<"wallet_sendPreparedCalls">;

export const fromRpcSendPreparedCallsResult = (
  rpcResult: RpcSendPreparedCallsResult,
): SendPreparedCallsResult => {
  if (rpcResult.details.type === "user-operations") {
    return {
      preparedCallIds: rpcResult.preparedCallIds,
      details: {
        type: "user-operations",
        data: rpcResult.details.data.map((item) => ({
          callId: item.callId,
          hash: item.hash,
          calls: item.calls?.map((call) => ({
            to: call.to,
            data: call.data,
            value: call.value != null ? hexToBigInt(call.value) : undefined,
          })),
        })),
      },
    };
  }

  return {
    preparedCallIds: rpcResult.preparedCallIds,
    details: {
      type: "user-operation",
      data: {
        hash: rpcResult.details.data.hash,
        calls: rpcResult.details.data.calls?.map((call) => ({
          to: call.to,
          data: call.data,
          value: call.value != null ? hexToBigInt(call.value) : undefined,
        })),
      },
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PrepareSign Result Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcPrepareSignResult = RpcMethodReturn<"wallet_prepareSign">;

export const fromRpcPrepareSignResult = (
  rpcResult: RpcPrepareSignResult,
): PrepareSignResult => {
  // Convert RPC signature request to viem-native format
  const signatureRequest =
    rpcResult.signatureRequest.type === "personal_sign"
      ? {
          type: "personal_sign" as const,
          data: rpcResult.signatureRequest.data as SignableMessage,
        }
      : {
          type: "eth_signTypedData_v4" as const,
          data: rpcResult.signatureRequest.data as TypedData,
        };

  return {
    chainId: hexToNumber(rpcResult.chainId),
    signatureRequest,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FormatSign Result Converter (no conversion needed)
// ─────────────────────────────────────────────────────────────────────────────

export const fromRpcFormatSignResult = (rpcResult: {
  signature: Hex;
}): FormatSignResult => {
  return {
    signature: rpcResult.signature,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GrantPermissions (createSession) Result Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcCreateSessionResult = RpcMethodReturn<"wallet_createSession">;

export const fromRpcCreateSessionResult = (
  rpcResult: RpcCreateSessionResult,
): GrantPermissionsResult => {
  return {
    sessionId: rpcResult.sessionId,
    chainId: hexToNumber(rpcResult.chainId),
    signatureRequest: {
      type: "eth_signTypedData_v4" as const,
      // Cast to TypedData - the top-level structure is correct
      data: rpcResult.signatureRequest.data as TypedData,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GetCallsStatus Result Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcGetCallsStatusResult = RpcMethodReturn<"wallet_getCallsStatus">;

// RPC uses numeric status codes, convert to user-friendly strings
const fromRpcStatus = (
  status: RpcGetCallsStatusResult["status"],
): GetCallsStatusResult["status"] => {
  // 100-199: pending states
  // 200: confirmed
  // 400+: failed states
  if (status >= 100 && status < 200) return "PENDING";
  if (status === 200) return "CONFIRMED";
  return "FAILED";
};

export const fromRpcGetCallsStatusResult = (
  rpcResult: RpcGetCallsStatusResult,
): GetCallsStatusResult => {
  return {
    id: rpcResult.id,
    chainId: hexToNumber(rpcResult.chainId),
    atomic: rpcResult.atomic,
    status: fromRpcStatus(rpcResult.status),
    receipts: rpcResult.receipts?.map((receipt) => ({
      logs: receipt.logs,
      status: receipt.status,
      blockHash: receipt.blockHash,
      blockNumber: hexToBigInt(receipt.blockNumber),
      gasUsed: hexToBigInt(receipt.gasUsed),
      transactionHash: receipt.transactionHash,
    })),
    details: {
      type: rpcResult.details.type,
      data: {
        hash: rpcResult.details.data.hash,
      },
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// RequestQuote Result Converter
// ─────────────────────────────────────────────────────────────────────────────

type RpcRequestQuoteResult = RpcMethodReturn<"wallet_requestQuote_v0">;

export const fromRpcRequestQuoteResult = (
  rpcResult: RpcRequestQuoteResult,
): RequestQuoteResult => {
  const baseQuote = {
    quote: {
      fromAmount: hexToBigInt(rpcResult.quote.fromAmount),
      minimumToAmount: hexToBigInt(rpcResult.quote.minimumToAmount),
      expiry: hexToBigInt(rpcResult.quote.expiry),
    },
    chainId: hexToNumber(rpcResult.chainId),
    callId: rpcResult.callId,
  };

  if (rpcResult.rawCalls === true) {
    const result: RequestQuoteResult_RawCalls = {
      ...baseQuote,
      rawCalls: true,
      calls: rpcResult.calls.map((call) => ({
        to: call.to,
        data: call.data,
        value: call.value != null ? hexToBigInt(call.value) : undefined,
      })),
    };
    return result;
  }

  // rawCalls: false - includes prepared calls
  const preparedCallsResult: RequestQuoteResult_PreparedCalls = {
    ...baseQuote,
    rawCalls: false,
    preparedCalls: fromRpcPrepareCallsResultForQuote(rpcResult),
  };
  return preparedCallsResult;
};

// Helper to extract prepared calls from quote result
// Reuses fromRpcPrepareCallsResult since the structure is the same
const fromRpcPrepareCallsResultForQuote = (
  rpcResult: Extract<RpcRequestQuoteResult, { rawCalls: false }>,
): RequestQuoteResult_PreparedCalls["preparedCalls"] => {
  // The quote result (when rawCalls: false) contains the same structure as PrepareCallsResult
  // We can reuse the existing converter
  const preparedCalls = fromRpcPrepareCallsResult(rpcResult);

  // Map the result to the quote-specific format
  switch (preparedCalls.type) {
    case "array":
      return {
        type: "array",
        data: preparedCalls.data.map((item) => {
          if (item.type === "authorization") {
            return {
              type: item.type,
              chainId: item.chainId,
              data: item.data,
              signatureRequest: item.signatureRequest,
            };
          }
          return {
            type: item.type,
            chainId: item.chainId,
            data: item.data,
            signatureRequest: item.signatureRequest,
            feePayment: item.feePayment,
          };
        }),
      };

    case "paymaster-permit":
      return {
        type: "paymaster-permit",
        data: preparedCalls.data,
        signatureRequest: preparedCalls.signatureRequest,
        modifiedRequest: preparedCalls.modifiedRequest,
      };

    case "user-operation-v060":
      return {
        type: "user-operation-v060",
        chainId: preparedCalls.chainId,
        data: preparedCalls.data,
        signatureRequest: preparedCalls.signatureRequest,
        feePayment: preparedCalls.feePayment,
      };

    case "user-operation-v070":
      return {
        type: "user-operation-v070",
        chainId: preparedCalls.chainId,
        data: preparedCalls.data,
        signatureRequest: preparedCalls.signatureRequest,
        feePayment: preparedCalls.feePayment,
      };

    default:
      return assertNever(
        preparedCalls,
        `Unexpected prepared calls type in quote result`,
      );
  }
};
