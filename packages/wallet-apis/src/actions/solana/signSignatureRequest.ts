import type { SolanaSigner } from "../../types.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";
import { hexToBytes } from "viem";
import { Base58 } from "ox";

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

  let signature: Uint8Array;

  if (signer.signTransaction) {
    signature = await signer.signTransaction(txBytes);
  } else if (signer.signMessage) {
    const numSigs = txBytes[0];
    const messageStart = 1 + numSigs * 64;
    const messageBytes = txBytes.slice(messageStart);
    signature = await signer.signMessage(messageBytes);
  } else {
    throw new BaseError(
      "SolanaSigner must implement either signTransaction or signMessage",
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: Base58.fromBytes(signature),
  };
}
