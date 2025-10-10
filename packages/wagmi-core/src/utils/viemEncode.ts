import {
  hexToBigInt,
  hexToNumber,
  isHex,
  type Address,
  type Authorization,
  type Capabilities,
  type Hex,
  type Signature,
  type UnionOmit,
} from "viem";
import { type PrepareCallsResult } from "@alchemy/wallet-apis";
import { assertNever } from "@alchemy/common";
import type { UserOperation } from "viem/account-abstraction";
import type {
  EcdsaSig,
  PreparedCall_Authorization,
  PreparedCall_Permit,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";
import { Capabilities as WalletApiCapabilities } from "@alchemy/wallet-api-types/capabilities";

export type ViemEncodedPreparedCalls =
  | (ViemEncodedUserOperationCall | ViemEncodedPaymasterPermitCall)
  | {
      type: "array";
      data: (ViemEncodedUserOperationCall | ViemEncodedAuthorizationCall)[];
    };

export const viemEncodePreparedCalls = (
  preparedCalls: PrepareCallsResult,
): ViemEncodedPreparedCalls => {
  if (preparedCalls.type === "array") {
    return {
      type: "array",
      data: preparedCalls.data.map((call) => {
        switch (call.type) {
          case "user-operation-v060":
          case "user-operation-v070":
            return viemEncodeUserOperationCall(call);
          case "authorization":
            return viemEncodeAuthorization(call);
          default:
            return assertNever(call, "Unexpected prepared call type in array");
        }
      }),
    };
  }

  switch (preparedCalls.type) {
    case "user-operation-v060":
    case "user-operation-v070":
      return viemEncodeUserOperationCall(preparedCalls);
    case "paymaster-permit":
      return viemEncodePaymasterPermitCall(preparedCalls);
    default:
      return assertNever(preparedCalls, "Unexpected prepared call type");
  }
};

export const viemEncodePreparedCall = (
  call:
    | PreparedCall_UserOpV060
    | PreparedCall_UserOpV070
    | PreparedCall_Permit
    | PreparedCall_Authorization,
):
  | ViemEncodedUserOperationCall
  | ViemEncodedPaymasterPermitCall
  | ViemEncodedAuthorizationCall => {
  switch (call.type) {
    case "user-operation-v060":
    case "user-operation-v070": {
      return viemEncodeUserOperationCall(call);
    }
    case "paymaster-permit": {
      return viemEncodePaymasterPermitCall(call);
    }
    case "authorization": {
      return viemEncodeAuthorization(call);
    }
    default: {
      return assertNever(call, "Unexpected prepared call type");
    }
  }
};

export type ViemEncodedUserOperationCall = {
  type: "user-operation-v070" | "user-operation-v060";
  chainId: number;
  data: UnionOmit<UserOperation, "signature">;
  signatureRequest: Pick<
    PreparedCall_UserOpV070,
    "signatureRequest"
  >["signatureRequest"];
  feePayment: Omit<PreparedCall_UserOpV070["feePayment"], "maxAmount"> & {
    maxAmount: bigint;
  };
};

const viemEncodeUserOperationCall = (
  call: PreparedCall_UserOpV060 | PreparedCall_UserOpV070,
): ViemEncodedUserOperationCall => {
  return {
    type: call.type,
    chainId: hexToNumber(call.chainId),
    data:
      call.type === "user-operation-v070"
        ? viemEncodeUoData070(call.data)
        : call.type === "user-operation-v060"
          ? viemEncodeUoData060(call.data)
          : assertNever(
              call,
              `Unexpected user operation type in 'viemEncodeUserOperationCall'`,
            ),
    signatureRequest: call.signatureRequest,
    feePayment: {
      sponsored: call.feePayment.sponsored,
      tokenAddress: call.feePayment.tokenAddress,
      maxAmount: hexToBigInt(call.feePayment.maxAmount),
    },
  };
};

const viemEncodeUoData060 = (
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

const viemEncodeUoData070 = (
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

export type ViemEncodedAuthorizationCall = Pick<
  PreparedCall_Authorization,
  "type" | "signatureRequest"
> &
  Pick<Authorization, "chainId"> & {
    data: Pick<Authorization, "nonce" | "address">;
  };

const viemEncodeAuthorization = (
  call: PreparedCall_Authorization,
): ViemEncodedAuthorizationCall => {
  return {
    ...call,
    chainId: hexToNumber(call.chainId),
    data: {
      ...call.data,
      nonce: hexToNumber(call.data.nonce),
    },
  };
};

export type ViemEncodedPaymasterPermitCall = Pick<
  PreparedCall_Permit,
  "type" | "data" | "signatureRequest"
> & {
  modifiedRequest: {
    from: Address;
    paymasterPermitSignature: ViemEncodedSignature | undefined;
    calls: { to: Address; data?: Hex; value?: bigint }[];
    capabilities?: Capabilities;
    chainId: number;
  };
};

const viemEncodePaymasterPermitCall = (
  call: PreparedCall_Permit,
): ViemEncodedPaymasterPermitCall => {
  return {
    ...call,
    modifiedRequest: {
      ...call.modifiedRequest,
      paymasterPermitSignature: viemEncodeSignature(
        call.modifiedRequest.paymasterPermitSignature,
      ),
      calls: call.modifiedRequest.calls.map((it) => ({
        to: it.to,
        data: it.data,
        value: it.value != null ? hexToBigInt(it.value) : undefined,
      })),
      capabilities: viemEncodeCapabilities(call.modifiedRequest.capabilities),
      chainId: hexToNumber(call.modifiedRequest.chainId),
    },
  };
};

type ViemEncodedSignature = {
  type: EcdsaSig["signature"]["type"];
  data: Signature | Hex;
};

const viemEncodeSignature = (
  signature: EcdsaSig["signature"] | undefined,
): ViemEncodedSignature | undefined => {
  if (!signature) {
    return undefined;
  }
  const { type, data } = signature;
  if (typeof data === "string") {
    return { type, data };
  }
  if ("yParity" in data) {
    return { type, data: { ...data, yParity: Number(data.yParity) } };
  }
  if ("v" in data) {
    return { type, data: { ...data, v: hexToBigInt(data.v) } };
  }
  return assertNever(data, "Signature object must include 'v' or 'yParity'");
};

type ViemEncodedCapabilities = Capabilities;

const viemEncodeCapabilities = (
  capabilities: WalletApiCapabilities | undefined,
): ViemEncodedCapabilities => {
  const { paymasterService, ...rest } = capabilities ?? {};
  return {
    ...rest,
    ...(rest?.gasParamsOverride && {
      gasParamsOverride: Object.fromEntries(
        Object.entries(rest.gasParamsOverride).map(([key, value]) => [
          key,
          isHex(value) ? hexToBigInt(value) : value,
        ]),
      ),
    }),
    ...(rest?.nonceOverride && {
      nonceOverride: {
        nonceKey: hexToBigInt(rest.nonceOverride.nonceKey),
      },
    }),
    ...(paymasterService && {
      alchemyPaymasterService: {
        ...("policyId" in paymasterService && {
          policyId: paymasterService.policyId,
        }),
        ...("policyIds" in paymasterService && {
          policyIds: paymasterService.policyIds,
        }),
        ...(paymasterService.onlyEstimation && {
          onlyEstimation: paymasterService.onlyEstimation,
        }),
        ...(paymasterService.erc20 && {
          erc20: {
            ...paymasterService.erc20,
            maxTokenAmount:
              paymasterService.erc20.maxTokenAmount != null
                ? hexToBigInt(paymasterService.erc20.maxTokenAmount)
                : undefined,
            ...("preOpSettings" in paymasterService.erc20 && {
              preOpSettings: {
                ...paymasterService.erc20.preOpSettings,
                ...("autoPermit" in paymasterService.erc20.preOpSettings && {
                  autoPermit: {
                    below: hexToBigInt(
                      paymasterService.erc20.preOpSettings.autoPermit.below,
                    ),
                    amount: hexToBigInt(
                      paymasterService.erc20.preOpSettings.autoPermit.amount,
                    ),
                    durationSeconds:
                      paymasterService.erc20.preOpSettings.autoPermit
                        .durationSeconds != null
                        ? hexToBigInt(
                            paymasterService.erc20.preOpSettings.autoPermit
                              .durationSeconds,
                          )
                        : undefined,
                  },
                }),
                ...("permitDetails" in paymasterService.erc20.preOpSettings && {
                  permitDetails: {
                    deadline: hexToBigInt(
                      paymasterService.erc20.preOpSettings.permitDetails
                        .deadline,
                    ),
                    value: hexToBigInt(
                      paymasterService.erc20.preOpSettings.permitDetails.value,
                    ),
                  },
                }),
              },
            }),
            ...("postOpSettings" in paymasterService.erc20 && {
              postOpSettings: {
                ...(paymasterService.erc20.postOpSettings.autoApprove && {
                  autoApprove: {
                    below: hexToBigInt(
                      paymasterService.erc20.postOpSettings.autoApprove.below,
                    ),
                    amount:
                      paymasterService.erc20.postOpSettings.autoApprove
                        .amount != null
                        ? hexToBigInt(
                            paymasterService.erc20.postOpSettings.autoApprove
                              .amount,
                          )
                        : undefined,
                  },
                }),
              },
            }),
          },
        }),
      },
    }),
  };
};
