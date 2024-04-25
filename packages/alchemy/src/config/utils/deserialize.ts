// https://github.com/wevm/wagmi/blob/main/packages/core/src/utils/deserialize.ts
type Reviver = (key: string, value: any) => any;

/**
 * JSON parses a string while correctly handling BigInt and Map types.
 *
 * @param value the string to deserialize
 * @param reviver optional reviver function to transform the parsed value
 * @returns the parsed object
 */
export function deserialize<type>(value: string, reviver?: Reviver): type {
  return JSON.parse(decodeURIComponent(value), (key, value_) => {
    let value = value_;
    if (value?.__type === "bigint") value = BigInt(value.value);
    if (value?.__type === "Map") value = new Map(value.value);
    return reviver?.(key, value) ?? value;
  });
}
