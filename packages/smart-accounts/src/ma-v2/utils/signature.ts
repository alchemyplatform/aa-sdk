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
  entityId: number;
  validationSignaturePrefix: SignaturePrefix | null;
  validationSignature: Hex;
};

/**
 * Signature packing utility for 1271 signatures.
 *
 * @param {Pack1271SignatureParams} params - The parameters for packing a 1271 signature.
 * @returns {Hex} The packed 1271 signature.
 */
export const pack1271Signature = ({
  entityId,
  validationSignaturePrefix,
  validationSignature,
}: Pack1271SignatureParams): Hex => {
  return concatHex([
    "0x00",
    toHex(entityId, { size: 4 }),
    "0xFF",
    ...(validationSignaturePrefix ? [validationSignaturePrefix] : []),
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

/**
 * A dummy WebAuthn signature used for gas estimation.
 */
export const WEBAUTHN_DUMMY_SIGNATURE =
  "0xff000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000";
