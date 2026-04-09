import {
  concatHex,
  hexToNumber,
  parseErc6492Signature,
  size,
  toHex,
  type Hex,
} from "viem";
import { SignaturePrefix } from "../types.js";

/**
 * Parses out the 3 components from a deferred action.
 *
 * @param {Hex} deferredAction - The deferred action to parse.
 * @returns {object} The parsed deferred action.
 */
export const parseDeferredAction = (
  deferredAction: Hex,
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

export type EncodeDeferredActionWithSignatureParams = {
  fullPreSignatureDeferredActionPayload: Hex;
  sig: Hex;
  signaturePrefix?: SignaturePrefix;
};

/**
 * Encodes the deferred action with its signature, producing the payload to prepend to the userOp signature.
 *
 * Assumption: The client this extends is used to sign the typed data.
 *
 * @param {EncodeDeferredActionWithSignatureParams} params - The parameters for encoding the deferred action with its signature.
 * @returns {Hex} The encoded payload to be prepended to the userOp signature.
 */
export const encodeDeferredActionWithSignature = ({
  fullPreSignatureDeferredActionPayload,
  sig,
}: EncodeDeferredActionWithSignatureParams): Hex => {
  // 6492 sigs don't work here.
  const _sig = parseErc6492Signature(sig).signature;

  const sigLength = size(_sig);

  const encodedData = concatHex([
    fullPreSignatureDeferredActionPayload,
    toHex(sigLength, { size: 4 }),
    _sig,
  ]);
  return encodedData;
};
