import type { SolanaPrepareCallsResult } from "./prepareCalls.js";
import type { SolanaSendPreparedCallsParams } from "./sendPreparedCalls.js";
import type { InnerWalletApiClient } from "../types.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../logger.js";

export async function signSolanaTransaction(
  client: InnerWalletApiClient<"solana">,
  prepared: SolanaPrepareCallsResult,
): Promise<SolanaSendPreparedCallsParams> {
  const signer = client.owner;
  const txBytes = hexToBytes(prepared.signatureRequest.data);

  LOGGER.debug("signSolanaTransaction:signing");

  const sigDicts = await signer.signTransactions([txBytes as unknown as never]);

  const sigDict = sigDicts[0];
  if (!sigDict) {
    throw new BaseError("Solana signer returned no signatures");
  }

  const signerAddress = signer.address;
  const sigBytes = sigDict[signerAddress];
  if (!sigBytes) {
    throw new BaseError(
      `Solana signer did not produce a signature for address ${signerAddress}`,
    );
  }

  const base58Sig = bytesToBase58(sigBytes);

  const {
    signatureRequest: _,
    feePayment: __,
    details: ___,
    ...rest
  } = prepared;
  return {
    ...rest,
    signature: {
      type: "ed25519" as const,
      data: base58Sig,
    },
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
