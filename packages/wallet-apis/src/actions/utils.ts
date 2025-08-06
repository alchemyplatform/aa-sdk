import type { RpcGasAndFeeOverrides } from "../schema.js";
import type {
  GasAndFeeOverridesRequest,
  RequestGasAndPaymasterAndDataResponse,
} from "./types.js";
import type { AlchemyRequestGasAndPaymasterAndDataSchema } from "../schema.js";
import { hexToBigInt, numberToHex } from "viem";

export function formatOverridesRequest(
  overrides: GasAndFeeOverridesRequest,
): RpcGasAndFeeOverrides {
  const rpcOverrides = {} as RpcGasAndFeeOverrides;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    // Check if the value is a Multiplier (has multiplier property)
    if (typeof value === "object" && value !== null && "multiplier" in value) {
      // Keep Multiplier as is (bigint)
      rpcOverrides[key as keyof RpcGasAndFeeOverrides] = value;
    } else if (typeof value === "bigint") {
      // Convert bigint to hex
      rpcOverrides[key as keyof RpcGasAndFeeOverrides] = numberToHex(value);
    } else {
      // For other types (like string), keep as is
      rpcOverrides[key as keyof RpcGasAndFeeOverrides] = value;
    }
  }

  return rpcOverrides;
}

export function formatGasAndPaymasterResponse(
  response: AlchemyRequestGasAndPaymasterAndDataSchema["ReturnType"],
): RequestGasAndPaymasterAndDataResponse {
  const commonFields = {
    callGasLimit: hexToBigInt(response.callGasLimit),
    preVerificationGas: hexToBigInt(response.preVerificationGas),
    verificationGasLimit: hexToBigInt(response.verificationGasLimit),
    maxFeePerGas: hexToBigInt(response.maxFeePerGas),
    maxPriorityFeePerGas: hexToBigInt(response.maxPriorityFeePerGas),
  };

  if ("paymasterAndData" in response) {
    return {
      ...commonFields,
      paymasterAndData: response.paymasterAndData,
    };
  } else {
    return {
      ...commonFields,
      paymaster: response.paymaster,
      paymasterData: response.paymasterData,
      paymasterVerificationGasLimit: hexToBigInt(
        response.paymasterVerificationGasLimit,
      ),
      paymasterPostOpGasLimit: hexToBigInt(response.paymasterPostOpGasLimit),
    };
  }
}
