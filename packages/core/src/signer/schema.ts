import { z } from "zod";
import type { SmartAccountSigner } from "./types";

export const createSignerSchema = <Inner>() =>
  z.custom<SmartAccountSigner<Inner>>((signer) => {
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
