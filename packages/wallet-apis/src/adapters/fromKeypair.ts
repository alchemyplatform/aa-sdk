import type { SolanaSigner } from "../types.js";
import { SolanaSignerError } from "./SolanaSignerError.js";
import { findSignerSlot } from "./resolveSignerSlot.js";

/** Raw Ed25519 keypair signer (e.g. `Keypair` from `@solana/web3.js` v1 or a bare Ed25519 key). */
export interface SolanaKeypairSigner {
  address: string;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

/**
 * Adapts a raw Ed25519 keypair signer into a {@link SolanaSigner}.
 *
 * Use this for legacy `@solana/web3.js` v1 `Keypair` signers or any signer
 * that exposes a `signMessage(bytes) => signature` interface. For
 * `@solana/kit` signers, use {@link fromKitSigner}. For browser wallets
 * (wallet adapter, Phantom, etc.), use {@link fromWalletAdapter}. For
 * wallet-standard wallets, use {@link fromWalletStandard}.
 *
 * Requires `@solana/kit` or `@solana/web3.js` as a peer dependency.
 *
 * @param {SolanaKeypairSigner} signer - The raw Ed25519 keypair signer to adapt
 * @returns {SolanaSigner} A SolanaSigner compatible with `createSmartWalletClient`
 */
export function fromKeypair(signer: SolanaKeypairSigner): SolanaSigner {
  return {
    address: signer.address,
    async signTransaction({ transaction }) {
      const numSigs = transaction[0];
      const messageStart = 1 + numSigs * 64;
      const messageBytes = transaction.slice(messageStart);
      const sig = await signer.signMessage(messageBytes);
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
