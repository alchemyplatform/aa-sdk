import {
  hexToBigInt,
  hexToNumber,
  type Address,
  type Capabilities,
  type Hex,
  type Prettify,
  type UnionOmit,
} from "viem";
import { type PrepareCallsResult } from "@alchemy/wallet-apis";
import { assertNever } from "@alchemy/common";
import type { UserOperation } from "viem/account-abstraction";
import type {
  PreparedCall_Authorization,
  PreparedCall_Permit,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";

export type TransformedPreparedCalls =
  | (TransformedUserOperationCall | TransformedPaymasterPermitCall)
  | {
      type: "array";
      data: (TransformedUserOperationCall | TransformedAuthorizationCall)[];
    };

// TODO(jh): prob also need opposite for `sendPreparedCalls`, so maybe
// name them 'encode' and 'decode'? probably should also write tests
// to encode -> decode and be sure we get back the original input.
export const transformPreparedCalls = (
  preparedCalls: PrepareCallsResult,
): TransformedPreparedCalls => {
  // TODO(jh): you could probably clean up this logic a bit to avoid casting.
  // there are certain types of calls that can only exist in arrays, and
  // other types that can only exist at the top level.
  return preparedCalls.type === "array"
    ? {
        type: "array",
        data: preparedCalls.data.map(transformCall) as (
          | ReturnType<typeof transformUserOperationCall>
          | ReturnType<typeof transformAuthorization>
        )[],
      }
    : (transformCall(preparedCalls) as
        | ReturnType<typeof transformUserOperationCall>
        | ReturnType<typeof transformPaymasterPermitCall>);
};

const transformCall = (
  call:
    | PreparedCall_UserOpV060
    | PreparedCall_UserOpV070
    | PreparedCall_Permit
    | PreparedCall_Authorization,
):
  | TransformedUserOperationCall
  | TransformedPaymasterPermitCall
  | TransformedAuthorizationCall => {
  switch (call.type) {
    case "user-operation-v060":
    case "user-operation-v070": {
      return transformUserOperationCall(call);
    }
    case "paymaster-permit": {
      return transformPaymasterPermitCall(call);
    }
    case "authorization": {
      return transformAuthorization(call);
    }
    default: {
      return assertNever(call, "Unexpected prepared call type");
    }
  }
};

type TransformedUserOperationCall = Prettify<
  Pick<PreparedCall_UserOpV070, "signatureRequest"> & {
    type: "user-operation-v070" | "user-operation-v060";
    chainId: number;
    data: UnionOmit<UserOperation, "signature">;
    feePayment: Omit<PreparedCall_UserOpV070["feePayment"], "maxAmount"> & {
      maxAmount: bigint;
    };
  }
>;

const transformUoData070 = (
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
    paymasterVerificationGasLimit: uo.paymasterVerificationGasLimit
      ? hexToBigInt(uo.paymasterVerificationGasLimit)
      : undefined,
    paymasterPostOpGasLimit: uo.paymasterPostOpGasLimit
      ? hexToBigInt(uo.paymasterPostOpGasLimit)
      : undefined,
  };
};

const transformUoData060 = (
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

// TODO(jh): maybe separate 06 & 07 data into separate functions.
const transformUserOperationCall = (
  call: PreparedCall_UserOpV060 | PreparedCall_UserOpV070,
): TransformedUserOperationCall => {
  return {
    type: call.type,
    chainId: hexToNumber(call.chainId),
    data:
      call.type === "user-operation-v070"
        ? transformUoData070(call.data)
        : call.type === "user-operation-v060"
          ? transformUoData060(call.data)
          : assertNever(
              call,
              `Unexpected user operation type in 'transformUserOperationCall'`,
            ),
    signatureRequest: call.signatureRequest,
    feePayment: {
      ...call.feePayment,
      maxAmount: BigInt(call.feePayment.maxAmount),
    },
  };
};

type TransformedPaymasterPermitCall = Prettify<
  Pick<PreparedCall_Permit, "type" | "data" | "signatureRequest"> & {
    modifiedRequest: {
      from: Address;
      paymasterPermitSignature: PreparedCall_Permit["modifiedRequest"]["paymasterPermitSignature"];
      calls: { to: Address; data?: Hex; value?: bigint }[];
      capabilities?: Capabilities;
      chainId: number;
    };
  }
>;

const transformPaymasterPermitCall = (
  call: PreparedCall_Permit,
): TransformedPaymasterPermitCall => {
  return {
    ...call,
    modifiedRequest: {
      ...call.modifiedRequest,
      paymasterPermitSignature: call.modifiedRequest.paymasterPermitSignature,
      calls: call.modifiedRequest.calls.map((it) => ({
        to: it.to,
        data: it.data,
        value: it.value ? BigInt(it.value) : undefined,
      })),
      // TODO(jh): transform the capabilities (erc 20 paymaster, anything else?)
      capabilities: call.modifiedRequest.capabilities,
      chainId: hexToNumber(call.modifiedRequest.chainId),
    },
  };
};

type TransformedAuthorizationCall = Prettify<
  Pick<PreparedCall_Authorization, "type" | "signatureRequest"> & {
    chainId: number;
    data: {
      nonce: bigint;
      address: Address;
    };
  }
>;

const transformAuthorization = (
  call: PreparedCall_Authorization,
): TransformedAuthorizationCall => {
  return {
    ...call,
    chainId: hexToNumber(call.chainId),
    data: {
      ...call.data,
      nonce: hexToBigInt(call.data.nonce),
    },
  };
};
