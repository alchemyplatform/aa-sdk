import {
  decodeFunctionData,
  encodeFunctionData,
  type Address,
  type Call,
  type Hex,
} from "viem";
import { LightAccountAbi_v1 } from "../abis/LightAccountAbi_v1.js";

// Conveniently, all variants of LA up to v2.0.0 use the same function signatures for `execute` and `executeBatch`.

export function encodeCallsLA(calls: readonly Call[]): Hex {
  if (calls.length === 1) {
    return encodeFunctionData({
      abi: LightAccountAbi_v1,
      functionName: "execute",
      args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? "0x"],
    });
  }

  const [targets, values, datas, hasValue] = calls.reduce(
    (accum, curr) => {
      accum[0].push(curr.to);
      accum[1].push(curr.value ?? 0n);
      accum[2].push(curr.data ?? "0x");
      accum[3] = accum[3] || (curr.value ?? 0n) !== 0n;
      return accum;
    },
    [[], [], [], false] as [Address[], bigint[], Hex[], boolean],
  );

  return encodeFunctionData({
    abi: LightAccountAbi_v1,
    functionName: "executeBatch",
    args: hasValue ? [targets, values, datas] : [targets, datas],
  });
}

export function decodeCallsLA(data: Hex, accountAddress: Address): Call[] {
  const decoded = decodeFunctionData({
    abi: LightAccountAbi_v1,
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
    // This function is overloaded - may or may not have an array for values.

    if (isThreeTupleArray(decoded.args)) {
      const [targets, values, datas] = decoded.args;

      if (targets.length !== values.length || targets.length !== datas.length) {
        throw new Error("Invalid arguments for executeBatch");
      }

      return targets.map((to, index) => ({
        to,
        value: values[index],
        data: datas[index],
      }));
    }

    // Two tuple array (no values)
    const [targets, datas] = decoded.args;

    if (targets.length !== datas.length) {
      throw new Error("Invalid arguments for executeBatch");
    }

    return targets.map((to, index) => ({
      to,
      data: datas[index],
    }));
  }

  // Otherwise, treat the call as a single call to the account itself.
  return [
    {
      to: accountAddress,
      data,
    },
  ];
}

// Needed to narrow types for LAv1 `executeBatch` function.
function isThreeTupleArray(
  input:
    | readonly [readonly Address[], readonly Hex[]]
    | readonly [readonly Address[], readonly bigint[], readonly Hex[]],
): input is readonly [readonly Address[], readonly bigint[], readonly Hex[]] {
  return input.length === 3;
}
