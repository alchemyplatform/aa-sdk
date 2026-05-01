import type { SolanaSigner } from "../types.js";
import { BaseError } from "@alchemy/common";

/** Any {@link https://solanakit.com @solana/kit} signer that implements `signTransactions` (e.g. `TransactionPartialSigner`, `KeyPairSigner`). */
export interface SolanaTransactionPartialSigner {
  address: string;
  signTransactions(
    transactions: readonly unknown[],
  ): Promise<readonly Record<string, Uint8Array>[]>;
}

/**
 * Adapts an {@link https://solanakit.com @solana/kit} signer into a {@link SolanaSigner}.
 *
 * Accepts any signer that implements `signTransactions`, including
 * `KeyPairSigner`, `TransactionPartialSigner`, and `NoopSigner`. For raw
 * Ed25519 keypairs, use {@link fromKeypair}. For browser wallets (wallet
 * adapter, Phantom, etc.), use {@link fromWalletAdapter}. For
 * wallet-standard wallets, use {@link fromWalletStandard}.
 *
 * Requires `@solana/kit` as a peer dependency.
 *
 * @param {SolanaTransactionPartialSigner} signer - The @solana/kit signer to adapt
 * @returns {SolanaSigner} A SolanaSigner compatible with `createSmartWalletClient`
 */
export function fromKitSigner(
  signer: SolanaTransactionPartialSigner,
): SolanaSigner {
  return {
    address: signer.address,
    async signTransaction({ transaction }) {
      const { getTransactionCodec } = await import("@solana/kit");
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
      if (sig.length !== 64) {
        throw new BaseError(
          `Expected a 64-byte Ed25519 signature but received ${sig.length} bytes`,
        );
      }

      // Assumes the Wallet API sends a transaction with exactly one empty
      // signature slot for this signer and the server resolves placement via
      // data.signer. If the API changes to accept a fully-signed transaction
      // body, this "first empty slot" heuristic breaks for multi-signer or
      // non-zero signer-slot transactions — resolve from signer.address instead.
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
