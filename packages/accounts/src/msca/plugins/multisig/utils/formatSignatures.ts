import { takeBytes } from "@alchemy/aa-core";
import { hexToBigInt, concat, toHex, pad } from "viem";
import type { Signature } from "../types";

/**
 *
 * @returns
 */
export const formatSignatures = (signatures: Signature[]) => {
  let eoaSigs: string = "";
  let contractSigs: string = "";
  let offset: bigint = BigInt(65 * signatures.length);
  signatures
    .sort((a, b) => {
      const bigintA = hexToBigInt(a.signer);
      const bigintB = hexToBigInt(b.signer);

      return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
    })
    .forEach((sig) => {
      // add 32 to v if the signature covers the actual gas values
      const addV = sig.userOpSigType === "ACTUAL" ? 32 : 0;

      if (sig.signerType === "EOA") {
        let v =
          parseInt(takeBytes(sig.signature, { count: 1, offset: 64 })) + addV;
        eoaSigs += concat([
          takeBytes(sig.signature, { count: 64 }),
          toHex(v, { size: 1 }),
        ]).slice(2);
      } else {
        const sigLen = BigInt(sig.signature.slice(2).length / 2);
        eoaSigs += concat([
          pad(sig.signer),
          toHex(offset, { size: 32 }),
          toHex(addV, { size: 1 }),
        ]).slice(2);
        contractSigs += concat([
          toHex(sigLen, { size: 32 }),
          sig.signature,
        ]).slice(2);
        offset += sigLen;
      }
    });
  return ("0x" + eoaSigs + contractSigs) as `0x${string}`;
};
