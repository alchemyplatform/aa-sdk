import type { SolanaSigner } from "../types.js";
import { VersionedTransaction } from "@solana/web3.js";

/** Any signer with a `publicKey` and `signTransaction(VersionedTransaction)` method — matches `useWallet()` from `@solana/wallet-adapter-react` and injected wallet providers like `window.phantom.solana`. */
export interface WalletAdapterSigner {
  publicKey: { toBase58(): string };
  signTransaction: <T extends VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
}

/**
 * Adapts a wallet that signs `VersionedTransaction` objects into a {@link SolanaSigner}.
 *
 * Works with `useWallet()` from `@solana/wallet-adapter-react` and injected
 * browser wallet providers (e.g. `window.phantom.solana`). Handles the
 * `Uint8Array` ↔ `VersionedTransaction` conversion internally.
 *
 * For `@solana/kit` signers, use {@link fromKitSigner}. For raw Ed25519
 * keypairs, use {@link fromKeypair}. Privy wallets from
 * `useConnectedStandardWallets()` already satisfy `SolanaSigner` directly.
 *
 * Requires `@solana/web3.js` as a peer dependency.
 *
 * @param {WalletAdapterSigner} signer - The wallet adapter signer
 * @returns {SolanaSigner} A SolanaSigner compatible with `createSmartWalletClient`
 */
export function fromWalletAdapter(signer: WalletAdapterSigner): SolanaSigner {
  return {
    address: signer.publicKey.toBase58(),
    async signTransaction({ transaction }) {
      const tx = VersionedTransaction.deserialize(transaction);
      const signed = await signer.signTransaction(tx);
      return { signedTransaction: new Uint8Array(signed.serialize()) };
    },
  };
}
