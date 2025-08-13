import {
  concatHex,
  encodeAbiParameters,
  toHex,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { SignaturePrefix } from "../types.js";
import { Signature, type WebAuthnP256 } from "ox";

export type PackUOSignatureParams = {
  // orderedHookData: HookData[];
  validationSignature: Hex;
};

/**
 * Signature packing utility for user operations.
 *
 * @param {PackUOSignatureParams} params - The parameters for packing a user operation signature.
 * @returns {Hex} The packed user operation signature.
 */
export const packUOSignature = ({
  // orderedHookData, TODO: integrate in next iteration of MAv2 sdk
  validationSignature,
}: PackUOSignatureParams): Hex => {
  return concatHex(["0xFF", "0x00", validationSignature]);
};

// TODO(v4): direct call validation 1271
export type Pack1271SignatureParams = {
  validationSignature: Hex;
  entityId: number;
};

/**
 * Signature packing utility for 1271 signatures.
 *
 * @param {Pack1271SignatureParams} params - The parameters for packing a 1271 signature.
 * @returns {Hex} The packed 1271 signature.
 */
export const pack1271Signature = ({
  validationSignature,
  entityId,
}: Pack1271SignatureParams): Hex => {
  return concatHex([
    "0x00",
    toHex(entityId, { size: 4 }),
    "0xFF",
    SignaturePrefix.EOA,
    validationSignature,
  ]);
};

/**
 * Converts a hash to a replay safe typed data.
 *
 * @param {ToReplaySafeTypedDataParams} params - The parameters for converting a hash to a replay safe typed data.
 * @returns {object} The replay safe typed data.
 */
export function toReplaySafeTypedData({
  address,
  chainId,
  hash,
  salt,
}: {
  address: Address;
  chainId: number;
  hash: Hash;
  salt?: Hex;
}) {
  return {
    domain: {
      chainId,
      verifyingContract: address,
      ...(salt ? { salt } : {}),
    },
    types: {
      ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
    },
    message: {
      hash,
    },
    primaryType: "ReplaySafeHash" as const,
  };
}
/**
 * Wraps a P256 signature with the webauthn metadata.
 *
 * @param {ToWebAuthnSignatureParams} params - The parameters for wrapping a P256 signature with the webauthn metadata.
 * @returns {object} The wrapped P256 signature.
 */
export function toWebAuthnSignature({
  webauthn,
  signature,
}: {
  webauthn: WebAuthnP256.SignMetadata;
  signature: Hex;
}) {
  const { r, s } = Signature.fromHex(signature);
  return encodeAbiParameters(
    [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "authenticatorData", type: "bytes" },
          { name: "clientDataJSON", type: "string" },
          { name: "challengeIndex", type: "uint256" },
          { name: "typeIndex", type: "uint256" },
          { name: "r", type: "uint256" },
          { name: "s", type: "uint256" },
        ],
      },
    ],
    [
      {
        authenticatorData: webauthn.authenticatorData,
        clientDataJSON: webauthn.clientDataJSON,
        challengeIndex: BigInt(webauthn.challengeIndex),
        typeIndex: BigInt(webauthn.typeIndex),
        r,
        s,
      },
    ],
  );
}
