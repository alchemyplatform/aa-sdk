import type { SolanaSigner } from "../types.js";
import { SolanaSignerError } from "./SolanaSignerError.js";
import { findSignerSlot } from "./resolveSignerSlot.js";

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
      let tx: unknown;
      try {
        const { getTransactionCodec } = await import("@solana/kit");
        const codec = getTransactionCodec();
        tx = codec.decode(transaction);
      } catch (e) {
        throw new SolanaSignerError("Failed to decode transaction", {
          cause: e as Error,
        });
      }

      let sigDict: Record<string, Uint8Array> | undefined;
      try {
        [sigDict] = await signer.signTransactions([tx]);
      } catch (e) {
        throw new SolanaSignerError("Kit signer failed to sign transaction", {
          cause: e as Error,
        });
      }
      if (!sigDict) {
        throw new SolanaSignerError("TransactionPartialSigner returned no signatures");
      }

      const sig = sigDict[signer.address];
      if (!sig) {
        throw new SolanaSignerError(
          `TransactionPartialSigner did not produce a signature for ${signer.address}`,
        );
      }
      if (sig.length !== 64) {
        throw new SolanaSignerError(
          `Expected a 64-byte Ed25519 signature but received ${sig.length} bytes`,
        );
      }

      const slotIndex = await findSignerSlot(transaction, signer.address);
      if (slotIndex < 0) {
        throw new SolanaSignerError(
          `Signer ${signer.address} is not a required signer in this transaction`,
        );
      }

      const signedTx = new Uint8Array(transaction);
      signedTx.set(sig, 1 + slotIndex * 64);
      return { signedTransaction: signedTx };
    },
  };
}
