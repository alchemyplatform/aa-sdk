/**
 * Revives a Map and BigInts from a JSON string that contains them
 * in the format of {__type: "bigint" | "Map", value: any }
 *
 * @param _key the key in the JSON object being revivied
 * @param value_ the value of the key being revived
 * @returns the revived value
 */
export const bigintMapReviver = (_key: string, value_: any) => {
  let value = value_;
  if (value?.__type === "bigint") value = BigInt(value.value);
  if (value?.__type === "Map") value = new Map(value.value);
  return value;
};
