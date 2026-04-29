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
 * (wallet adapter, Phantom, etc.), use {@link fromWalletAdapter}.
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
