import type { Hex } from "viem";

type TakeBytesOpts = {
  count?: number;
  offset?: number;
};

/**
 * Given a bytes string, returns a slice of the bytes
 * @param bytes - the hex string representing bytes
 * @param count - the number of bytes to take
 * @param offset - the offset to start taking bytes from
 */
export const takeBytes = (
  bytes: Hex,
  { offset, count }: TakeBytesOpts
): Hex => {
  const start = (offset ? offset * 2 : 0) + 2; // add 2 to skip the 0x prefix
  const end = count ? start + count * 2 : undefined;

  return `0x${bytes.slice(start, end)}`;
};
