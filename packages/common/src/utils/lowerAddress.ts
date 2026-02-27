import { type Address } from "viem";

/**
 * Lowercase an address
 *
 * @param {Address} addr - The address to lowercase
 * @returns {Address} The lowercase address
 */
export const lowerAddress = (addr: Address): Address =>
  addr.toLowerCase() as Address;
