import {
  decodeFunctionData,
  encodeFunctionData,
  type Address,
  type Call,
  type Hex,
} from "viem";
import { IStandardExecutorAbi } from "../abis/IStandardExecutor.js";

/**
 * Encodes an array of calls into ModularAccountV1 calldata for `execute` or `executeBatch`.
 * Used internally by the ModularAccountV1 SmartAccount implementation. Typically not needed
 * directly unless you have an advanced use case.
 *
 * @param {Call[]} calls The calls to encode.
 * @returns {Hex} The encoded calldata.
 */
export function encodeCallsMAv1(calls: readonly Call[]): Hex {
  if (calls.length === 1) {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "execute",
      args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? "0x"],
    });
  }

  return encodeFunctionData({
    abi: IStandardExecutorAbi,
    functionName: "executeBatch",
    args: [
      calls.map((call) => ({
        target: call.to,
        value: call.value ?? 0n,
        data: call.data ?? "0x",
      })),
    ],
  });
}

/**
 * Decodes ModularAccountV1 calldata back into an array of calls.
 * Used internally by the ModularAccountV1 SmartAccount implementation. Typically not needed
 * directly unless you have an advanced use case.
 *
 * @param {Hex} data The calldata to decode.
 * @param {Address} accountAddress The account address, used as the `to` for unrecognized selectors.
 * @returns {Call[]} The decoded calls.
 */
export function decodeCallsMAv1(data: Hex, accountAddress: Address): Call[] {
  const decoded = decodeFunctionData({
    abi: IStandardExecutorAbi,
    data,
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
