import { BigNumber } from "alchemy-sdk";
import { URL } from "react-native-url-polyfill";

export const capitalizeFirstLetter = (str: string) => {
  return str && str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str;
};

export const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(min + Math.random() * (max + 1 - min));
};

export const truncate = (text: string, [h, t]: number[] = [5, 5]): string => {
  const head = text.slice(0, h);
  const tail = text.slice(-1 * t, text.length);
  return text.length > h + t ? [head, tail].join("...") : text;
};

export const isValidHttpUrl = (src: string | undefined): boolean => {
  if (!src) {
    return false;
  }

  let url;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export * from "./font";

/**
 * Converts a given string to a hashed string.
 * */
export function hash(str: string) {
  return String(
    Math.abs(
      str.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0),
    ),
  );
}

/**
 * Replace a specific range of text in the string with another text.
 * */
export function replace(str: string, start: number, end: number, text: string) {
  return str.slice(0, start) + text + str.slice(end);
}

/**
 * Returns the value corresponding to the first true index of a given condition array.
 * */
export function conditionChaining<T, V>(conditions: T[], values: V[]) {
  const idx = conditions.findIndex((state) => Boolean(state));
  return idx > -1 ? values[idx] : values[values.length - 1];
}

/**
 * Returns a new object with only the specified keys from the input object.
 *
 * @param {Object} obj - The input object to pick keys from.
 * @param {Array<string>} keys - An array of keys to pick from the input object.
 * @returns {Object} - A new object containing only the specified keys from the input object.
 * @example
 * ```ts
 *   pick({ a: 1, b: '2', c: true }, ['a', 'c']); // returns { a: 1, c: true }
 * ```
 */
export function pick<
  T extends { [key: string]: unknown },
  Keys extends keyof T,
>(obj: T, keys: Keys[]) {
  return keys.reduce((pickedObj, key) => {
    pickedObj[key] = obj[key];
    return pickedObj;
  }, {} as { [key in Keys]: T[key] });
}

export function mergeObjectArrays<T>(A: T[], B: T[], key: keyof T): T[] {
  const uniqueValues = new Set(A.map((obj) => obj[key]));
  const newArr = [...A];

  for (let i = 0; i < B.length; i++) {
    if (!uniqueValues.has(B[i][key])) {
      newArr.push(B[i]);
      uniqueValues.add(B[i][key]);
    }
  }

  return newArr;
}

export const convertTimestampToDate = (timestamp: BigNumber) =>
  new Date(BigNumber.from(timestamp).mul(1000).toNumber()).toLocaleString();
