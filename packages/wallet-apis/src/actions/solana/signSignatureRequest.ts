import type { SolanaSigner } from "../../types.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";
import { hexToBytes } from "viem";
import { Base58 } from "ox";
import { findSignerSlot } from "../../adapters/resolveSignerSlot.js";

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

  const { signedTransaction } = await signer.signTransaction({
    transaction: txBytes,
  });

  const slotIndex = await findSignerSlot(txBytes, signer.address);
  if (slotIndex < 0) {
    throw new BaseError(
      `Signer ${signer.address} is not a required signer in this transaction`,
    );
  }

  const offset = 1 + slotIndex * 64;
  const rawSignature = signedTransaction.slice(offset, offset + 64);

  if (rawSignature.every((b) => b === 0)) {
    throw new BaseError(
      `Signer ${signer.address} did not produce a signature at slot ${slotIndex}`,
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: Base58.fromBytes(rawSignature),
  };
}
