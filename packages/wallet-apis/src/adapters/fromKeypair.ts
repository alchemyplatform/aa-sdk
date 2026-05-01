import type { SolanaSigner } from "../types.js";
import { BaseError } from "@alchemy/common";

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
        throw new BaseError(
          `Expected a 64-byte Ed25519 signature but received ${sig.length} bytes`,
        );
      }

      // Assumes the Wallet API sends a transaction with exactly one empty
      // signature slot for this signer and the server resolves placement via
      // data.signer. If the API changes to accept a fully-signed transaction
      // body, this "first empty slot" heuristic breaks for multi-signer or
      // non-zero signer-slot transactions — resolve from signer.address instead.
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
