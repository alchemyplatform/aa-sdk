import {
  concat,
  encodeAbiParameters,
  parseAbiParameters,
  type Address,
  type Hash,
  type Hex,
} from "viem";

export type SignWith6492Params = {
  factoryAddress: Address;
  factoryCalldata: Hex;
  signature: Hash;
};

/**
 * Wraps a given signature with additional data following the EIP-6492 standard.
 *
 * @example
 * ```ts
 * import { wrapSignatureWith6492 } from "@aa-sdk/core";
 *
 * const signature = wrapSignatureWith6492({
 *  factoryAddress: "0x...",
 *  factoryCalldata: "0x...",
 *  signature: "0x...",
 * });
 * ```
 *
 * @param {SignWith6492Params} params The parameters to wrap the signature
 * @param {Hex} params.factoryAddress The address of the factory
 * @param {Hex} params.factoryCalldata The calldata for the factory
 * @param {Hex} params.signature The original signature that needs to be wrapped
 * @returns {Hash} The wrapped signature
 */
export const wrapSignatureWith6492 = ({
  factoryAddress,
  factoryCalldata,
  signature,
}: SignWith6492Params): Hash => {
  // wrap the signature as follows: https://eips.ethereum.org/EIPS/eip-6492
  // concat(
  //  abi.encode(
  //    (create2Factory, factoryCalldata, originalERC1271Signature),
  //    (address, bytes, bytes)),
  //    magicBytes
  // )
  return concat([
    encodeAbiParameters(parseAbiParameters("address, bytes, bytes"), [
      factoryAddress,
      factoryCalldata,
      signature,
    ]),
    "0x6492649264926492649264926492649264926492649264926492649264926492",
  ]);
};
