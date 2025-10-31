import { isHex, sliceHex, toHex, type Hex } from "viem";
import type { SmartAccountSigner } from "@aa-sdk/core";
import type { WebAuthnPublicKey } from "@alchemy/wallet-api-types";
import type { ToWebAuthnAccountParameters } from "viem/account-abstraction";
import type { WebAuthnSigner } from "./client";

export type Expect<T extends true> = T;

export const assertNever = (_val: never, msg: string): never => {
  throw new Error(msg);
};

/**
 * If the value is already Hex, it is returned unchanged. If it's a string, number or bigint, it's converted.
 *
 * @param {string | number | bigint | Hex} val - The value to convert to Hex.
 * @returns {Hex} The Hex value.
 *
 * @example
 * ```ts
 * const hex = castToHex("0x1234");
 * const hex2 = castToHex(1234);
 * const hex3 = castToHex(BigInt(1234));
 * ```
 */
export const castToHex = (val: string | number | bigint | Hex): Hex => {
  if (isHex(val)) {
    return val;
  }
  return toHex(val);
};

export function isWebAuthnSigner(
  signer: SmartAccountSigner | WebAuthnSigner,
): signer is WebAuthnSigner {
  return "credential" in signer;
}

export function credentialToWebAuthnPublicKey(
  credential: ToWebAuthnAccountParameters["credential"],
): WebAuthnPublicKey {
  const { x, y } = {
    x: sliceHex(credential.publicKey, 0, 32, { strict: true }),
    y: sliceHex(credential.publicKey, 32, 64, { strict: true }),
  };

  return {
    x,
    y,
  };
}
