import { z } from "zod";
import type { SmartAccountSigner } from "./types";

/**
 * Checks if the provided object is a `SmartAccountSigner`.
 *
 * @example
 * ```ts
 * import { isSigner, LocalAccountSigner } from "@aa-sdk/core";
 *
 * const signer = new LocalAccountSigner(...);
 * console.log(isSigner(signer)); // true
 * ```
 *
 * @param {any} signer the object to check
 * @returns {boolean} A boolean indicating whether the object is a `SmartAccountSigner`
 */
export const isSigner = (signer: any): signer is SmartAccountSigner => {
  return (
    signer != null &&
    typeof signer === "object" &&
    "signerType" in signer &&
    "signMessage" in signer &&
    "signTypedData" in signer &&
    "getAddress" in signer &&
    "inner" in signer
  );
};

export const SignerSchema = z.custom<SmartAccountSigner>(isSigner);
