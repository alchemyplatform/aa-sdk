import { z } from "zod";
import type { SmartAccountSigner } from "./types";

export const SignerSchema = z.custom<SmartAccountSigner>((signer) => {
  return (
    signer != null &&
    typeof signer === "object" &&
    "signerType" in signer &&
    "signMessage" in signer &&
    "signTypedData" in signer &&
    "getAddress" in signer &&
    "inner" in signer
  );
});
