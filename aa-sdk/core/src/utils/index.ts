import type { Chain } from "viem";
import { toHex } from "viem";
import * as chains from "viem/chains";
import * as alchemyChains from "../chains/index.js";
import type { PromiseOrValue } from "../types.js";
import type { RecordableKeys } from "./types.js";

export const AlchemyChainMap = new Map<number, Chain>(
  Object.values(alchemyChains).map((c) => [c.id, c])
);

/**
 * Utility method for converting a chainId to a {@link Chain} object
 *
 * @param chainId - the chainId to convert
 * @returns a {@link Chain} object for the given chainId
 * @throws if the chainId is not found
 */
export const getChain = (chainId: number): Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return AlchemyChainMap.get(chain.id) ?? chain;
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
  <S, O, F>(...fns: ((s: S, o?: O, f?: F) => Promise<S>)[]) =>
  async (s: S, o?: O, f?: F) => {
    let result = s;
    for (const fn of fns) {
      result = await fn(result, o, f);
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

  return filterUndefined<T>(
    results.reduce((accum, curr) => {
      accum[curr.key as keyof T] = curr.value;
      return accum;
    }, {} as T)
  );
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

export function filterUndefined<T>(obj: T): T {
  for (const key in obj) {
    if (obj[key] == null) {
      delete obj[key];
    }
  }
  return obj as T;
}

export function pick(obj: Record<string, unknown>, keys: string | string[]) {
  return Object.keys(obj)
    .filter((k) => keys.includes(k))
    .reduce((res, k) => Object.assign(res, { [k]: obj[k] }), {});
}

/**
 * Utility method for checking if the passed in values are all equal (strictly)
 *
 * @param params - values to check
 * @returns a boolean indicating if all values are the same
 * @throws if no values are passed in
 */
export const allEqual = (...params: any[]): boolean => {
  if (params.length === 0) {
    throw new Error("no values passed in");
  }
  return params.every((v) => v === params[0]);
};

/**
 * Utility method for checking the condition and return the value if condition holds true, undefined if not.
 *
 * @param condition - condition to check
 * @param value - value to return when condition holds true
 * @returns the value if condition holds true, undefined if not
 */
export const conditionalReturn = <T>(
  condition: Promise<boolean>,
  value: () => Promise<T>
): Promise<T | undefined> => condition.then((t) => (t ? value() : undefined));

export const toRecord = <
  T extends { [K in RecordableKeys<T>]: string | number | symbol },
  K extends RecordableKeys<T>,
  V
>(
  array: T[],
  selector: K,
  fn: (item: T) => V
): Record<T[K], V> =>
  array.reduce((acc, item) => {
    acc[item[selector]] = fn(item);
    return acc;
  }, {} as Record<T[K], V>);

export * from "./bigint.js";
export * from "./bytes.js";
export * from "./defaults.js";
export * from "./schema.js";
export type * from "./types.js";
export * from "./userop.js";
