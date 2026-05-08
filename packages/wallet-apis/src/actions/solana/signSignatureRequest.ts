import type { SolanaSigner } from "../../types.js";
import { LOGGER } from "../../logger.js";
import { hexToBytes } from "viem";
import { Base58 } from "ox";
import { findSignerSlot } from "../../adapters/resolveSignerSlot.js";
import { SolanaSignerError } from "../../adapters/SolanaSignerError.js";

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

  const slotIndex = await findSignerSlot(txBytes, signer.address);
  if (slotIndex < 0) {
    throw new SolanaSignerError(
      `Signer ${signer.address} is not a required signer in this transaction`,
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:signing");

  const { signedTransaction } = await signer.signTransaction({
    transaction: txBytes,
  });

  if (signedTransaction[0] !== txBytes[0]) {
    throw new SolanaSignerError(
      `Signer returned a transaction with a different signature count (expected ${txBytes[0]}, got ${signedTransaction[0]})`,
    );
  }

  const offset = 1 + slotIndex * 64;
  const rawSignature = signedTransaction.slice(offset, offset + 64);

  if (rawSignature.length !== 64) {
    throw new SolanaSignerError(
      `Signed transaction too short to contain signature at slot ${slotIndex}`,
    );
  }

  if (rawSignature.every((b) => b === 0)) {
    throw new SolanaSignerError(
      `Signer ${signer.address} did not produce a signature at slot ${slotIndex}`,
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: Base58.fromBytes(rawSignature),
  };
}
