import type { Hex } from "viem";

type TakeBytesOpts = {
  count?: number;
  offset?: number;
};

/**
 * Given a bytes string, returns a slice of the bytes
 *
 * @param {Hex} bytes - the hex string representing bytes
 * @param {TakeBytesOpts} opts - optional parameters for slicing the bytes
 * @param {number} opts.offset - the offset in bytes to start slicing from
 * @param {number} opts.count - the number of bytes to slice
 * @returns {Hex} the sliced bytes
 */
export const takeBytes = (bytes: Hex, opts: TakeBytesOpts = {}): Hex => {
  const { offset, count } = opts;
  const start = (offset ? offset * 2 : 0) + 2; // add 2 to skip the 0x prefix
  const end = count ? start + count * 2 : undefined;

  return `0x${bytes.slice(start, end)}`;
};
