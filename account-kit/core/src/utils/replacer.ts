/**
 * JSON stringify replacer that correctly handles BigInt and Map types.
 *
 * @param {string} key the key in the JSON object
 * @param {any} value_ the value to convert if map or bigint
 * @returns {any} the replaced value
 */
export const storeReplacer = (key: string, value_: any) => {
  let value = value_;
  if (key === "transport") {
    value = { __type: "Transport", ...value };
  }
  if (typeof value === "bigint")
    value = { __type: "bigint", value: value_.toString() };
  if (value instanceof Map)
    value = {
      __type: "Map",
      value: Array.from(value_.entries()),
    };
  return value;
};
