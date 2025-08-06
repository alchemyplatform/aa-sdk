import { concatHex, hexToNumber, size, toHex, type Hex } from "viem";
import { SignaturePrefix } from "../types.js";

// Parses out the 3 components from a deferred action
export const parseDeferredAction = (
  deferredAction: Hex
): {
  entityId: number;
  isGlobalValidation: boolean;
  nonce: bigint;
  deferredActionData: Hex;
  hasAssociatedExecHooks: boolean;
} => {
  // 2 for 0x, 2 for 00/01, 38 for parallel nonce, 8 for entity id, 2 for options byte, 16 for parallel nonce
  return {
    entityId: hexToNumber(`0x${deferredAction.slice(42, 50)}`),
    isGlobalValidation:
      hexToNumber(`0x${deferredAction.slice(50, 52)}`) % 2 === 1,
    nonce: BigInt(`0x${deferredAction.slice(4, 68)}`),
    deferredActionData: `0x${deferredAction.slice(68)}` as Hex,
    hasAssociatedExecHooks: deferredAction[3] === "1",
  };
};

export type BuildDeferredActionDigestParams = {
  fullPreSignatureDeferredActionDigest: Hex;
  sig: Hex;
  signaturePrefix?: SignaturePrefix;
};

/**
 * Creates the digest which must be prepended to the userOp signature.
 *
 * Assumption: The client this extends is used to sign the typed data.
 *
 * @param {object} args The argument object containing the following:
 * @param {Hex} args.fullPreSignatureDeferredActionDigest The The data to append the signature and length to
 * @param {Hex} args.sig The signature to include in the digest
 * @param {Hex} args.signaturePrefix Prefix to append to the signature (defaults to "0x00" for EOA type)
 * @returns {Hex} The encoded digest to be prepended to the userOp signature
 */
export const buildDeferredActionDigest = ({
  fullPreSignatureDeferredActionDigest,
  sig,
  signaturePrefix = SignaturePrefix.EOA,
}: BuildDeferredActionDigestParams): Hex => {
  const prefixedSig = concatHex([signaturePrefix, sig]);

  const sigLength = size(prefixedSig);

  const encodedData = concatHex([
    fullPreSignatureDeferredActionDigest,
    toHex(sigLength, { size: 4 }),
    prefixedSig,
  ]);
  return encodedData;
};
