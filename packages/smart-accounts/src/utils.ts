import { type Client, concat, type Hex, toHex } from "viem";
import { call } from "viem/actions";
import { getAction } from "viem/utils";
import type { UserOperation } from "viem/account-abstraction";
import { BaseError } from "@alchemy/common";

const RIP_7212_CHECK_BYTECODE =
  "0x60806040526040517f532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25815260056020820152600160408201527f4a03ef9f92eb268cafa601072489a56380fa0dc43171d7712813b3a19a1eb5e560608201527f3e213e28a608ce9a2f4a17fd830c6654018a79b3e0263d91a8ba90622df6f2f0608082015260208160a0836101005afa503d5f823e3d81f3fe";

export const chainHas7212 = async (client: Client): Promise<boolean> => {
  const callAction = getAction(client, call, "call");

  const { data } = await callAction({
    data: RIP_7212_CHECK_BYTECODE,
  });

  return data ? BigInt(data) === 1n : false;
};

export function packAccountGasLimits(
  data:
    | Pick<UserOperation, "verificationGasLimit" | "callGasLimit">
    | Pick<UserOperation, "maxPriorityFeePerGas" | "maxFeePerGas">
): Hex {
  return concat(Object.values(data).map((v) => toHex(v, { size: 16 })));
}

export function packPaymasterData({
  paymaster,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  paymasterData,
}: Pick<
  UserOperation,
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
    toHex(paymasterVerificationGasLimit, { size: 16 }),
    toHex(paymasterPostOpGasLimit, { size: 16 }),
    paymasterData,
  ]);
}

export const bigIntMultiply = (
  base: number | bigint | Hex,
  multiplier: number,
  roundingMode: "ROUND" | "FLOOR" | "CEIL" = "CEIL"
) => {
  if (Number.isInteger(multiplier)) {
    return BigInt(base) * BigInt(multiplier);
  }

  const multiplierStr = multiplier.toString();
  const decimalPlaces = multiplierStr.split(".")[1]?.length ?? 0;

  if (decimalPlaces > 4) {
    throw new BaseError("bigIntMultiply max precision is 4 decimal places.");
  }

  const scale = BigInt(10 ** decimalPlaces);
  const scaledMultiplier = BigInt(multiplierStr.replace(".", ""));
  const product = BigInt(base) * scaledMultiplier;

  switch (roundingMode) {
    case "ROUND":
      return (product + scale / 2n) / scale;
    case "CEIL":
      return product >= 0n ? (product + scale - 1n) / scale : product / scale;
    case "FLOOR":
    default:
      return product >= 0n ? product / scale : (product - scale + 1n) / scale;
  }
};
