import {
  concat,
  encodeAbiParameters,
  hexToBigInt,
  isAddress,
  keccak256,
  pad,
  type Address,
  type Chain,
  type Hash,
  type Hex,
} from "viem";
import { EntryPointAbi_v7 } from "../abis/EntryPointAbi_v7.js";
import type {
  UserOperationRequest,
  UserOperationRequest_v7,
} from "../types.js";
import type { SupportedEntryPoint } from "./types.js";

const packUserOperation = (request: UserOperationRequest<"0.7.0">): Hex => {
  const initCode =
    request.factory && request.factoryData
      ? concat([request.factory, request.factoryData])
      : "0x";
  const accountGasLimits = packAccountGasLimits(
    (({ verificationGasLimit, callGasLimit }) => ({
      verificationGasLimit,
      callGasLimit,
    }))(request)
  );

  const gasFees = packAccountGasLimits(
    (({ maxPriorityFeePerGas, maxFeePerGas }) => ({
      maxPriorityFeePerGas,
      maxFeePerGas,
    }))(request)
  );

  const paymasterAndData =
    request.paymaster && isAddress(request.paymaster)
      ? packPaymasterData(
          (({
            paymaster,
            paymasterVerificationGasLimit,
            paymasterPostOpGasLimit,
            paymasterData,
          }) => ({
            paymaster,
            paymasterVerificationGasLimit,
            paymasterPostOpGasLimit,
            paymasterData,
          }))(request)
        )
      : "0x";

  return encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
    ],
    [
      request.sender as Address,
      hexToBigInt(request.nonce),
      keccak256(initCode),
      keccak256(request.callData),
      accountGasLimits,
      hexToBigInt(request.preVerificationGas),
      gasFees,
      keccak256(paymasterAndData),
    ]
  );
};

export default {
  version: "0.7.0",

  address: {
    default: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  },

  abi: EntryPointAbi_v7,

  getUserOperationHash: (
    request: UserOperationRequest<"0.7.0">,
    entryPointAddress: Address,
    chainId: number
  ): Hash => {
    const encoded = encodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
      [
        keccak256(packUserOperation(request)),
        entryPointAddress,
        BigInt(chainId),
      ]
    );

    return keccak256(encoded);
  },

  packUserOperation,
} satisfies SupportedEntryPoint<"0.7.0", Chain, typeof EntryPointAbi_v7>;

export function packAccountGasLimits(
  data:
    | Pick<UserOperationRequest_v7, "verificationGasLimit" | "callGasLimit">
    | Pick<UserOperationRequest_v7, "maxPriorityFeePerGas" | "maxFeePerGas">
): Hex {
  return concat(Object.values(data).map((v) => pad(v, { size: 16 })));
}

export function packPaymasterData({
  paymaster,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  paymasterData,
}: Pick<
  UserOperationRequest_v7,
  | "paymaster"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
  | "paymasterData"
>): Hex {
  if (
    !paymaster ||
    !paymasterVerificationGasLimit ||
    !paymasterPostOpGasLimit ||
    !paymasterData
  ) {
    return "0x";
  }
  return concat([
    paymaster,
    pad(paymasterVerificationGasLimit, { size: 16 }),
    pad(paymasterPostOpGasLimit, { size: 16 }),
    paymasterData,
  ]);
}

export function unpackAccountGasLimits(accountGasLimits: string): {
  verificationGasLimit: number;
  callGasLimit: number;
} {
  return {
    verificationGasLimit: parseInt(accountGasLimits.slice(2, 34), 16),
    callGasLimit: parseInt(accountGasLimits.slice(34), 16),
  };
}
