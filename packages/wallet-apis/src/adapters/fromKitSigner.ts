import { getTransactionCodec } from "@solana/kit";
import type { SolanaStandardSigner } from "../types.js";
import { BaseError } from "@alchemy/common";

/** Any {@link https://solanakit.com @solana/kit} signer that implements `signTransactions` (e.g. `TransactionPartialSigner`, `KeyPairSigner`). */
export interface SolanaTransactionPartialSigner {
  address: string;
  signTransactions(
    transactions: readonly unknown[],
  ): Promise<readonly Record<string, Uint8Array>[]>;
}

/**
 * Adapts an {@link https://solanakit.com @solana/kit} signer into a {@link SolanaStandardSigner}.
 *
 * Accepts any signer that implements `signTransactions`, including
 * `KeyPairSigner`, `TransactionPartialSigner`, and `NoopSigner`. For raw
 * Ed25519 keypairs that aren't from `@solana/kit`, use {@link fromKeypair}
 * instead.
 *
 * Requires `@solana/kit` as a peer dependency.
 *
 * @param {SolanaTransactionPartialSigner} signer - The @solana/kit signer to adapt
 * @returns {SolanaStandardSigner} A wallet-standard compatible signer
 */
export function fromKitSigner(
  signer: SolanaTransactionPartialSigner,
): SolanaStandardSigner {
  return {
    address: signer.address,
    async signTransaction({ transaction }) {
      const codec = getTransactionCodec();
      const tx = codec.decode(transaction);

      const [sigDict] = await signer.signTransactions([tx]);
      if (!sigDict) {
        throw new BaseError("TransactionPartialSigner returned no signatures");
      }

      const sig = sigDict[signer.address];
      if (!sig) {
        throw new BaseError(
          `TransactionPartialSigner did not produce a signature for ${signer.address}`,
        );
      }

      const numSigs = transaction[0];
      const signedTx = new Uint8Array(transaction);
      for (let i = 0; i < numSigs; i++) {
        const offset = 1 + i * 64;
        if (transaction.slice(offset, offset + 64).every((b) => b === 0)) {
          signedTx.set(sig, offset);
          return { signedTransaction: signedTx };
        }
      }

      throw new BaseError(
        `No empty signature slot found for signer ${signer.address}`,
      );
    },
  };
}
