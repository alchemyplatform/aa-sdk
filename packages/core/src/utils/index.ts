import type { Address, Hash, Hex } from "viem";
import { encodeAbiParameters, hexToBigInt, keccak256, toHex } from "viem";
import * as chains from "viem/chains";
import type { PromiseOrValue, UserOperationRequest } from "../types.js";

/**
 * Utility method for converting a chainId to a {@link chains.Chain} object
 *
 * @param chainId
 * @returns a {@link chains.Chain} object for the given chainId
 * @throws if the chainId is not found
 */
export const getChain = (chainId: number): chains.Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  throw new Error("could not find chain");
};

/**
 * Utility function that allows for piping a series of async functions together
 *
 * @param fns - functions to pipe
 * @returns result of the pipe
 */
export const asyncPipe =
  <T>(...fns: ((x: T) => Promise<T>)[]) =>
  async (x: T) => {
    let result = x;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };

// based on @ethersproject/properties, but pulled in here to minize the dependency on ethers
export type Deferrable<T> = {
  [K in keyof T]: PromiseOrValue<T[K]>;
};

/**
 * Await all of the properties of a {@link Deferrable} object
 *
 * @param object - a {@link Deferrable} object
 * @returns the object with its properties resolved
 */
export async function resolveProperties<T>(object: Deferrable<T>): Promise<T> {
  const promises = Object.keys(object).map((key) => {
    const value = object[key as keyof Deferrable<T>];
    return Promise.resolve(value).then((v) => ({ key: key, value: v }));
  });

  const results = await Promise.all(promises);

  return results.reduce((accum, curr) => {
    accum[curr.key as keyof T] = curr.value;
    return accum;
  }, {} as T);
}

/**
 * Recursively converts all values in an object to hex strings
 *
 * @param obj - obj to deep hexlify
 * @returns object with all of its values hexlified
 */
export function deepHexlify(obj: any): any {
  if (typeof obj === "function") {
    return undefined;
  }
  if (obj == null || typeof obj === "string" || typeof obj === "boolean") {
    return obj;
  } else if (typeof obj === "bigint") {
    return toHex(obj);
  } else if (obj._isBigNumber != null || typeof obj !== "object") {
    return toHex(obj).replace(/^0x0/, "0x");
  }
  if (Array.isArray(obj)) {
    return obj.map((member) => deepHexlify(member));
  }
  return Object.keys(obj).reduce(
    (set, key) => ({
      ...set,
      [key]: deepHexlify(obj[key]),
    }),
    {}
  );
}

/**
 * Generates a hash for a UserOperation valid from entrypoint version 0.6 onwards
 *
 * @param request - the UserOperation to get the hash for
 * @param entryPointAddress - the entry point address that will be used to execute the UserOperation
 * @param chainId - the chain on which this UserOperation will be executed
 * @returns the hash of the UserOperation
 */
export function getUserOperationHash(
  request: UserOperationRequest,
  entryPointAddress: Address,
  chainId: bigint
): Hash {
  const encoded = encodeAbiParameters(
    [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
    [keccak256(packUo(request)), entryPointAddress, chainId]
  ) as `0x${string}`;

  return keccak256(encoded);
}

function packUo(request: UserOperationRequest): Hex {
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
}

// borrowed from ethers.js
export function defineReadOnly<T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K]
): void {
  Object.defineProperty(object, key, {
    enumerable: true,
    value: value,
    writable: false,
  });
}

export * from "./bigint.js";
