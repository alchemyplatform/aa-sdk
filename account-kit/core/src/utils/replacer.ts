/**
 * JSON stringify replacer that correctly handles BigInt and Map types.
 *
 * @param _key the key in the JSON object
 * @param value_ the value to convert if map or bigint
 * @returns the replaced value
 */
export const bigintMapReplacer = (_key: string, value_: any) => {
  let value = value_;
  if (typeof value === "bigint")
    value = { __type: "bigint", value: value_.toString() };
  if (value instanceof Map)
    value = {
      __type: "Map",
      value: Array.from(value_.entries()),
    };
  return value;
};
