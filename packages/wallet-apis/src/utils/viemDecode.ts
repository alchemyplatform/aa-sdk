import {
  isHex,
  numberToHex,
  toHex,
  type Capabilities,
  type Hex,
  type Signature,
} from "viem";
import { type PrepareCallsResult } from "@alchemy/wallet-apis";
import { assertNever } from "@alchemy/common";
import type {
  EcdsaSig,
  PreparedCall_Authorization,
  PreparedCall_Permit,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";
import type { Capabilities as WalletApiCapabilities } from "@alchemy/wallet-api-types/capabilities";
import type {
  ViemEncodedAuthorizationCall,
  ViemEncodedPaymasterPermitCall,
  ViemEncodedPreparedCalls,
  ViemEncodedUserOperationCall,
} from "./viemEncode.js";

export const viemDecodePreparedCalls = (
  encodedCalls: ViemEncodedPreparedCalls,
): PrepareCallsResult => {
  if (encodedCalls.type === "array") {
    return {
      type: "array",
      data: encodedCalls.data.map((call) => {
        switch (call.type) {
          case "user-operation-v060":
          case "user-operation-v070":
            return viemDecodeUserOperationCall(call);
          case "authorization":
            return viemDecodeAuthorization(call);
          default:
            return assertNever(call, "Unexpected encoded call type in array");
        }
      }),
    };
  }

  switch (encodedCalls.type) {
    case "user-operation-v060":
    case "user-operation-v070":
      return viemDecodeUserOperationCall(encodedCalls);
    case "paymaster-permit":
      return viemDecodePaymasterPermitCall(encodedCalls);
    default:
      return assertNever(encodedCalls, "Unexpected encoded call type");
  }
};

export const viemDecodePreparedCall = (
  call:
    | ViemEncodedUserOperationCall
    | ViemEncodedPaymasterPermitCall
    | ViemEncodedAuthorizationCall,
):
  | PreparedCall_UserOpV060
  | PreparedCall_UserOpV070
  | PreparedCall_Permit
  | PreparedCall_Authorization => {
  switch (call.type) {
    case "user-operation-v060":
    case "user-operation-v070": {
      return viemDecodeUserOperationCall(call);
    }
    case "paymaster-permit": {
      return viemDecodePaymasterPermitCall(call);
    }
    case "authorization": {
      return viemDecodeAuthorization(call);
    }
    default: {
      return assertNever(call, "Unexpected prepared call type");
    }
  }
};

const viemDecodeUserOperationCall = (
  call: ViemEncodedUserOperationCall,
): PreparedCall_UserOpV060 | PreparedCall_UserOpV070 => {
  switch (call.type) {
    case "user-operation-v060": {
      return {
        type: call.type,
        chainId: numberToHex(call.chainId),
        data: {
          sender: call.data.sender,
          nonce: toHex(call.data.nonce),
          initCode: call.data.initCode!,
          callData: call.data.callData,
          callGasLimit: toHex(call.data.callGasLimit),
          verificationGasLimit: toHex(call.data.verificationGasLimit),
          preVerificationGas: toHex(call.data.preVerificationGas),
          maxFeePerGas: toHex(call.data.maxFeePerGas),
          maxPriorityFeePerGas: toHex(call.data.maxPriorityFeePerGas),
          paymasterAndData: "0x",
        },
        signatureRequest: call.signatureRequest,
        feePayment: {
          sponsored: call.feePayment.sponsored,
          tokenAddress: call.feePayment.tokenAddress,
          maxAmount: toHex(call.feePayment.maxAmount),
        },
      } satisfies PreparedCall_UserOpV060;
    }
    case "user-operation-v070": {
      return {
        type: call.type,
        chainId: numberToHex(call.chainId),
        data: {
          sender: call.data.sender,
          nonce: toHex(call.data.nonce),
          factory: call.data.factory,
          factoryData: call.data.factoryData,
          callData: call.data.callData,
          callGasLimit: toHex(call.data.callGasLimit),
          verificationGasLimit: toHex(call.data.verificationGasLimit),
          preVerificationGas: toHex(call.data.preVerificationGas),
          maxFeePerGas: toHex(call.data.maxFeePerGas),
          maxPriorityFeePerGas: toHex(call.data.maxPriorityFeePerGas),
          paymaster: call.data.paymaster,
          paymasterData: call.data.paymasterData,
          paymasterVerificationGasLimit:
            call.data.paymasterVerificationGasLimit != null
              ? toHex(call.data.paymasterVerificationGasLimit)
              : undefined,
          paymasterPostOpGasLimit:
            call.data.paymasterPostOpGasLimit != null
              ? toHex(call.data.paymasterPostOpGasLimit)
              : undefined,
        },
        signatureRequest: call.signatureRequest,
        feePayment: {
          sponsored: call.feePayment.sponsored,
          tokenAddress: call.feePayment.tokenAddress,
          maxAmount: toHex(call.feePayment.maxAmount),
        },
      } satisfies PreparedCall_UserOpV070;
    }
    default: {
      return assertNever(
        call.type,
        `Unexpected user operation type in 'viemDecodeUserOperationCall'`,
      );
    }
  }
};

const viemDecodeAuthorization = (
  call: ViemEncodedAuthorizationCall,
): PreparedCall_Authorization => {
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

const viemDecodePaymasterPermitCall = (
  call: ViemEncodedPaymasterPermitCall,
): PreparedCall_Permit => {
  return {
    type: call.type,
    data: call.data,
    signatureRequest: call.signatureRequest,
    modifiedRequest: {
      from: call.modifiedRequest.from,
      paymasterPermitSignature: viemDecodeSignature(
        call.modifiedRequest.paymasterPermitSignature,
      ),
      calls: call.modifiedRequest.calls.map((it) => ({
        to: it.to,
        data: it.data,
        value: it.value != null ? toHex(it.value) : undefined,
      })),
      capabilities: viemDecodeCapabilities(call.modifiedRequest.capabilities),
      chainId: numberToHex(call.modifiedRequest.chainId),
    },
  };
};

type DecodedSignature = EcdsaSig["signature"];

const viemDecodeSignature = (
  signature:
    | {
        type: EcdsaSig["signature"]["type"];
        data: Signature | Hex;
      }
    | undefined,
): DecodedSignature | undefined => {
  if (!signature) {
    return undefined;
  }
  const { type, data } = signature;
  if (isHex(data)) {
    return { type, data };
  }
  if ("yParity" in data && data.yParity != null) {
    return { type, data: { ...data, yParity: toHex(data.yParity) } };
  }
  if ("v" in data) {
    return { type, data: { ...data, v: toHex(data.v) } };
  }
  return assertNever(data, "Signature object must include 'v' or 'yParity'");
};

export const viemDecodeCapabilities = (
  capabilities: Capabilities | undefined,
): WalletApiCapabilities => {
  const { alchemyPaymaster, ...rest } = capabilities ?? {};
  return {
    ...rest,
    ...(rest?.gasParamsOverride && {
      gasParamsOverride: Object.fromEntries(
        Object.entries(rest.gasParamsOverride).map(([key, value]) => [
          key,
          typeof value === "bigint" ? toHex(value) : value,
        ]),
      ),
    }),
    ...(rest?.nonceOverride && {
      nonceOverride: {
        nonceKey: toHex(rest.nonceOverride.nonceKey),
      },
    }),
    ...(alchemyPaymaster && {
      paymasterService: {
        ...("policyId" in alchemyPaymaster && {
          policyId: alchemyPaymaster.policyId,
        }),
        ...("policyIds" in alchemyPaymaster && {
          policyIds: alchemyPaymaster.policyIds,
        }),
        ...(alchemyPaymaster.onlyEstimation && {
          onlyEstimation: alchemyPaymaster.onlyEstimation,
        }),
        ...(alchemyPaymaster.erc20 && {
          erc20: {
            ...alchemyPaymaster.erc20,
            maxTokenAmount:
              alchemyPaymaster.erc20.maxTokenAmount != null
                ? toHex(alchemyPaymaster.erc20.maxTokenAmount)
                : undefined,
            ...("preOpSettings" in alchemyPaymaster.erc20 && {
              preOpSettings: {
                ...alchemyPaymaster.erc20.preOpSettings,
                ...("autoPermit" in alchemyPaymaster.erc20.preOpSettings && {
                  autoPermit: {
                    below: toHex(
                      alchemyPaymaster.erc20.preOpSettings.autoPermit.below,
                    ),
                    amount: toHex(
                      alchemyPaymaster.erc20.preOpSettings.autoPermit.amount,
                    ),
                    durationSeconds:
                      alchemyPaymaster.erc20.preOpSettings.autoPermit
                        .durationSeconds != null
                        ? toHex(
                            alchemyPaymaster.erc20.preOpSettings.autoPermit
                              .durationSeconds,
                          )
                        : undefined,
                  },
                }),
                ...("permitDetails" in alchemyPaymaster.erc20.preOpSettings && {
                  permitDetails: {
                    deadline: toHex(
                      alchemyPaymaster.erc20.preOpSettings.permitDetails
                        .deadline,
                    ),
                    value: toHex(
                      alchemyPaymaster.erc20.preOpSettings.permitDetails.value,
                    ),
                  },
                }),
              },
            }),
            ...("postOpSettings" in alchemyPaymaster.erc20 && {
              postOpSettings: {
                ...(alchemyPaymaster.erc20.postOpSettings.autoApprove && {
                  autoApprove: {
                    below: toHex(
                      alchemyPaymaster.erc20.postOpSettings.autoApprove.below,
                    ),
                    amount:
                      alchemyPaymaster.erc20.postOpSettings.autoApprove
                        .amount != null
                        ? toHex(
                            alchemyPaymaster.erc20.postOpSettings.autoApprove
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
