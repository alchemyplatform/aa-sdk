import {
  encodeAbiParameters,
  hexToBigInt,
  keccak256,
  type Address,
  type Chain,
  type Hash,
  type Hex,
} from "viem";
import { EntryPointAbi_v6 } from "../abis/EntryPointAbi_v6.js";
import type { UserOperationRequest } from "../types.js";
import type { SupportedEntryPoint } from "./types.js";

const packUserOperation = (request: UserOperationRequest<"0.6.0">): Hex => {
  const hashedInitCode = keccak256(request.initCode);
  const hashedCallData = keccak256(request.callData);
  const hashedPaymasterAndData = keccak256(request.paymasterAndData);

  return encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes32" },
    ],
    [
      request.sender as Address,
      hexToBigInt(request.nonce),
      hashedInitCode,
      hashedCallData,
      hexToBigInt(request.callGasLimit),
      hexToBigInt(request.verificationGasLimit),
      hexToBigInt(request.preVerificationGas),
      hexToBigInt(request.maxFeePerGas),
      hexToBigInt(request.maxPriorityFeePerGas),
      hashedPaymasterAndData,
    ]
  );
};

export default {
  version: "0.6.0",

  address: {
    default: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  },

  abi: EntryPointAbi_v6,

  getUserOperationHash: (
    request: UserOperationRequest<"0.6.0">,
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
} satisfies SupportedEntryPoint<"0.6.0", Chain, typeof EntryPointAbi_v6>;
