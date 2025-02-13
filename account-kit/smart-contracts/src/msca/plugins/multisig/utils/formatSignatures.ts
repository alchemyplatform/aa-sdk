import { takeBytes } from "@aa-sdk/core";
import { concat, hexToBigInt, pad, toHex } from "viem";
import type { Signature } from "../types";

/**
 * Formats a collection of Signature objects into a single aggregated signature.
 * The format is in the form of EOA_SIGS | CONTRACT_SIG_DATAS. The signatures are ordered
 * by signer address. The EOA SIGS contain the 65 signautre data for EOA signers and 65 bytes containing SIGNER | OFFSET | V for contract signers.
 * The OFFSET is used to fetch the signature data from the CONTRACT_SIG_DATAS.
 *
 * @param {Signature[]} signatures the array of Signature objects to combine into the correct aggregated signature format excluding the upper limits
 * @param {boolean} usingMaxValues a boolean indicating wether or not the UserOperation is using the UPPER_LIMIT for the gas and fee values
 * @returns {Hex} the Hex representation of the signature
 */
export const formatSignatures = (
  signatures: Signature[],
  usingMaxValues: boolean = false
) => {
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
      const addV = sig.userOpSigType === "ACTUAL" && !usingMaxValues ? 32 : 0;

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
