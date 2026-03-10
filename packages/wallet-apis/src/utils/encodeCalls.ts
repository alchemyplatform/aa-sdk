import { BaseError } from "@alchemy/common";
import { encodeFunctionData } from "viem";
import type { Abi, Address } from "abitype";
import type { Call } from "viem";
import type { Hex } from "viem";

type EncodedCall = {
  to: Address;
  data?: Hex;
  value?: bigint;
};

/**
 * Encodes an array of calls, converting any abi-style calls to encoded data.
 * Calls that already have encoded `data` are passed through unchanged.
 *
 * @param {ReadonlyArray<Call>} calls - Array of calls, either encoded or abi-style
 * @returns {Array<EncodedCall>} Array of calls with encoded data
 */
export function encodeCalls(calls: readonly Call[]): EncodedCall[] {
  return calls.map((call) => {
    if (call.dataSuffix != null) {
      throw new BaseError(
        "`dataSuffix` on individual calls is not supported. Use `capabilities.experimental_dataSuffix` instead.",
      );
    }

    const data = call.abi
      ? encodeFunctionData({
          abi: call.abi as Abi,
          functionName: call.functionName!,
          args: call.args as readonly unknown[],
        })
      : call.data;

    return {
      to: call.to,
      ...(data != null ? { data } : {}),
      ...(call.value != null ? { value: call.value } : {}),
    };
  });
}
