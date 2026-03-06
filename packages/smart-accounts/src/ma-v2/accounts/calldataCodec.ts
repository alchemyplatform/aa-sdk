import {
  decodeFunctionData,
  encodeFunctionData,
  type Address,
  type Call,
  type Hex,
} from "viem";
import { sliceHex } from "viem/utils";
import { modularAccountAbi } from "../abis/modularAccountAbi.js";
import { EXECUTE_USER_OP_SELECTOR } from "../utils/account.js";
import { BaseError } from "@alchemy/common";

/**
 * Encodes an array of calls into ModularAccountV2 calldata for `execute` or `executeBatch`.
 * Used internally by the ModularAccountV2 SmartAccount implementation. Typically not needed
 * directly unless you have an advanced use case.
 *
 * @param {Call[]} calls The calls to encode.
 * @returns {Hex} The encoded calldata.
 */
export function encodeCallsMAv2(calls: readonly Call[]): Hex {
  if (!calls.length) {
    throw new BaseError("No calls to encode.");
  }

  if (calls.length === 1) {
    return encodeFunctionData({
      abi: modularAccountAbi,
      functionName: "execute",
      args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? "0x"],
    });
  }

  return encodeFunctionData({
    abi: modularAccountAbi,
    functionName: "executeBatch",
    args: [
      calls.map((call) => ({
        target: call.to,
        data: call.data ?? "0x",
        value: call.value ?? 0n,
      })),
    ],
  });
}

/**
 * Decodes ModularAccountV2 calldata back into an array of calls. Strips the `EXECUTE_USER_OP_SELECTOR` prefix if present.
 * Used internally by the ModularAccountV2 SmartAccount implementation. Typically not needed
 * directly unless you have an advanced use case.
 *
 * @param {Hex} data The calldata to decode.
 * @param {Address} accountAddress The account address, used as the `to` for unrecognized selectors.
 * @returns {Call[]} The decoded calls.
 */
export function decodeCallsMAv2(data: Hex, accountAddress: Address): Call[] {
  // Strip the EXECUTE_USER_OP_SELECTOR prefix if present.
  const trimmedData = data
    .toLowerCase()
    .startsWith(EXECUTE_USER_OP_SELECTOR.toLowerCase())
    ? sliceHex(data, 4)
    : data;

  const decoded = decodeFunctionData({
    abi: modularAccountAbi,
    data: trimmedData,
  });

  if (decoded.functionName === "execute") {
    return [
      {
        to: decoded.args[0],
        value: decoded.args[1],
        data: decoded.args[2],
      },
    ];
  }

  if (decoded.functionName === "executeBatch") {
    return decoded.args[0].map((call) => ({
      to: call.target,
      value: call.value,
      data: call.data,
    }));
  }

  // If the data is not for an `execute` or `executeBatch` call, treat it as a single call to the account itself.
  return [
    {
      to: accountAddress,
      data,
    },
  ];
}
