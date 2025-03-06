import { toHex } from "viem";
import type { PromiseOrValue } from "../types.js";
import type { RecordableKeys } from "./types.js";

/**
 * Utility function that allows for piping a series of async functions together
 *
 * @param {((s: S, o?: O, f?: F) => Promise<S>)[]} fns - functions to pipe
 * @returns {S} result of the pipe
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
 * Used to ensure type doesn't extend another, for use in & chaining of properties
 */
export type NotType<A, B> = A extends B ? never : unknown;

/**
 * Await all of the properties of a Deferrable object
 *
 * @param {Deferrable<T>} object - a Deferrable object
 * @returns {Promise<T>} the object with its properties resolved
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
 * @param {any} obj - obj to deep hexlify
 * @returns {any} object with all of its values hexlified
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
 * Filters out properties with undefined or null values from the provided object.
 *
 * @example
 * ```ts
 * import { filterUndefined } from "@aa-sdk/core";
 *
 * const result = filterUndefined({
 *  foo: undefined,
 *  bar: null,
 *  baz: "baz",
 * }); // { baz: "baz" }
 * ```
 *
 * @param {T} obj the object from which to remove properties with undefined or null values
 * @returns {T} the object with undefined or null properties removed
 */
export function filterUndefined<T>(obj: T): T {
  for (const key in obj) {
    if (obj[key] == null) {
      delete obj[key];
    }
  }
  return obj as T;
}

/**
 * Picks the specified keys from an object and returns a new object containing only those key-value pairs.
 *
 * @example
 * ```ts
 * import { pick } from "@aa-sdk/core";
 *
 * const picked = pick({
 *  foo: "foo",
 *  bar: "bar",
 * }, ["foo"]); // { foo: "foo" }
 * ```
 *
 * @param {Record<string, unknown>} obj The object from which to pick keys
 * @param {string|string[]} keys A single key or an array of keys to pick from the object
 * @returns {Record<string, unknown>} A new object containing only the picked key-value pairs
 */
export function pick(obj: Record<string, unknown>, keys: string | string[]) {
  return Object.keys(obj)
    .filter((k) => keys.includes(k))
    .reduce((res, k) => Object.assign(res, { [k]: obj[k] }), {});
}

/**
 * Utility method for checking if the passed in values are all equal (strictly)
 *
 * @param {...any[]} params - values to check
 * @returns {boolean} a boolean indicating if all values are the same
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
 * @param {Promise<boolean>} condition - condition to check
 * @param {() => Promise<T>} value - value to return when condition holds true
 * @returns {Promise<T | undefined>} the value if condition holds true, undefined if not
 */
export const conditionalReturn = <T>(
  condition: Promise<boolean>,
  value: () => Promise<T>
): Promise<T | undefined> => condition.then((t) => (t ? value() : undefined));

/**
 * Converts an array of objects into a record (object) where each key is determined by the specified selector and the value is determined by the provided function.
 *
 * @example
 * ```ts
 * import { toRecord } from "@aa-sdk/core";
 * import { sepolia, mainnet } from "viem/chains";
 *
 * const addressesByChain = toRecord(
 *  [sepolia, mainnet],
 *  "id",
 *  () => "0x..."
 * ); // { [sepolia.id]: "0x...", [mainnet.id]: "0x..." }
 * ```
 *
 * @param {T[]} array The array of objects to convert to a record
 * @param {K} selector The key used to select the property that will become the record's key
 * @param {(item: T) => V} fn The function that transforms each item in the array into the record's value
 * @returns {Record<T[K], V>} The resulting record object
 */
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
