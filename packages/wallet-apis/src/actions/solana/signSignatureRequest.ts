import type { SolanaSigner } from "../../types.js";
import {
  isWalletStandardSigner,
  isTransactionPartialSigner,
  isMessageSigner,
} from "../../utils/assertions.js";
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

  let rawSignature: Uint8Array;

  if (isWalletStandardSigner(signer)) {
    const { signedTransaction } = await signer.signTransaction({
      transaction: txBytes,
    });
    rawSignature = extractSignerSignature(txBytes, signedTransaction, signer.address);
  } else if (isTransactionPartialSigner(signer)) {
    const [sigDict] = await signer.signTransactions([txBytes]);
    if (!sigDict) {
      throw new BaseError("TransactionPartialSigner returned no signatures");
    }
    const sig = sigDict[signer.address];
    if (!sig) {
      throw new BaseError(
        `TransactionPartialSigner did not produce a signature for ${signer.address}`,
      );
    }
    rawSignature = sig;
  } else if (isMessageSigner(signer)) {
    const numSigs = txBytes[0];
    const messageStart = 1 + numSigs * 64;
    const messageBytes = txBytes.slice(messageStart);
    rawSignature = await signer.signMessage(messageBytes);
  } else {
    throw new BaseError(
      "SolanaSigner must implement signTransaction, signTransactions, or signMessage",
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: Base58.fromBytes(rawSignature),
  };
}

function extractSignerSignature(
  unsignedTx: Uint8Array,
  signedTx: Uint8Array,
  signerAddress: string,
): Uint8Array {
  const numSigs = signedTx[0];

  for (let i = 0; i < numSigs; i++) {
    const offset = 1 + i * 64;
    const unsignedSig = unsignedTx.slice(offset, offset + 64);
    const signedSig = signedTx.slice(offset, offset + 64);

    const wasEmpty = unsignedSig.every((b) => b === 0);
    const isNowFilled = !signedSig.every((b) => b === 0);

    if (wasEmpty && isNowFilled) {
      return signedSig;
    }
  }

  throw new BaseError(
    `Could not find signature for signer ${signerAddress} in signed transaction`,
  );
}
