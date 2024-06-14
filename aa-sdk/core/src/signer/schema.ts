import { z } from "zod";
import type { SmartAccountSigner } from "./types";

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
