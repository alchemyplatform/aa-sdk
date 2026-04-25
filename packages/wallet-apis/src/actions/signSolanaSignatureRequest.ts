import type { SolanaSigner } from "../types.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../logger.js";

export type SolanaSignatureRequestParams = {
  type: "solana_signTransaction";
  data: `0x${string}`;
};

export type SolanaSignatureResult = {
  type: "ed25519";
  data: string;
};

export async function signSolanaSignatureRequest(
  signer: SolanaSigner,
  signatureRequest: SolanaSignatureRequestParams,
): Promise<SolanaSignatureResult> {
  const txBytes = hexToBytes(signatureRequest.data);

  LOGGER.debug("signSolanaSignatureRequest:signing");

  const [sigDict] = await signer.signTransactions([txBytes]);
  if (!sigDict) {
    throw new BaseError("Solana signer returned no signatures");
  }

  const sigBytes = sigDict[signer.address];
  if (!sigBytes) {
    throw new BaseError(
      `Solana signer did not produce a signature for address ${signer.address}`,
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: bytesToBase58(sigBytes),
  };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function bytesToBase58(bytes: Uint8Array): string {
  let num = 0n;
  for (const b of bytes) {
    num = num * 256n + BigInt(b);
  }

  let result = "";
  while (num > 0n) {
    const mod = num % 58n;
    result = BASE58_ALPHABET[Number(mod)] + result;
    num = num / 58n;
  }

  for (const b of bytes) {
    if (b === 0) result = "1" + result;
    else break;
  }

  return result;
}
