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

// Signature packing utility for user operations
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

// Signature packing utility for 1271 signatures
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
    ]
  );
}
