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
    rawSignature = extractSignerSignature(
      txBytes,
      signedTransaction,
      signer.address,
    );
  } else if (isTransactionPartialSigner(signer)) {
    rawSignature = await signWithTransactionPartialSigner(signer, txBytes);
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

async function signWithTransactionPartialSigner(
  signer: import("../../types.js").SolanaTransactionPartialSigner,
  txBytes: Uint8Array,
): Promise<Uint8Array> {
  // Dynamically import @solana/kit to deserialize the raw tx bytes into a
  // Transaction object that TransactionPartialSigner.signTransactions expects.
  // This keeps @solana/kit as an optional peer dep — only needed for this path.
  let getTransactionCodec: Awaited<typeof import("@solana/kit")>["getTransactionCodec"];
  try {
    const solKit = await import("@solana/kit");
    getTransactionCodec = solKit.getTransactionCodec;
  } catch {
    throw new BaseError(
      "@solana/kit is required when using a TransactionPartialSigner. " +
        "Install it with: npm install @solana/kit",
    );
  }

  const codec = getTransactionCodec();
  const transaction = codec.decode(txBytes);

  const [sigDict] = await signer.signTransactions([transaction]);
  if (!sigDict) {
    throw new BaseError("TransactionPartialSigner returned no signatures");
  }

  const sig = sigDict[signer.address];
  if (!sig) {
    throw new BaseError(
      `TransactionPartialSigner did not produce a signature for ${signer.address}`,
    );
  }

  return sig;
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
