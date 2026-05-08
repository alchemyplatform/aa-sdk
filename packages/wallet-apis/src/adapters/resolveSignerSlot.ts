import { SolanaSignerError } from "./SolanaSignerError.js";

/**
 * Finds the signature slot index for `signerAddress` by decoding the
 * transaction message and looking up the address in the account keys.
 * Tries `@solana/kit` first, falls back to `@solana/web3.js`.
 *
 * @param {Uint8Array} transaction - The serialized Solana transaction bytes
 * @param {string} signerAddress - The base58-encoded address of the signer
 * @returns {Promise<number>} The slot index, or -1 if the address is not a required signer
 */
export async function findSignerSlot(
  transaction: Uint8Array,
  signerAddress: string,
): Promise<number> {
  let accounts: readonly string[];
  let numRequiredSigners: number;

  try {
    const { getCompiledTransactionMessageDecoder } = await import(
      "@solana/kit"
    );
    const numSigs = transaction[0];
    const messageBytes = transaction.slice(1 + numSigs * 64);
    const decoded =
      getCompiledTransactionMessageDecoder().decode(messageBytes);
    accounts = decoded.staticAccounts as readonly string[];
    numRequiredSigners = decoded.header.numSignerAccounts;
  } catch {
    try {
      const { VersionedTransaction } = await import("@solana/web3.js");
      const vtx = VersionedTransaction.deserialize(transaction);
      accounts = vtx.message.staticAccountKeys.map((k) => k.toBase58());
      numRequiredSigners = vtx.message.header.numRequiredSignatures;
    } catch {
      throw new SolanaSignerError(
        "Failed to decode transaction: install @solana/kit or @solana/web3.js",
      );
    }
  }

  const slotIndex = accounts.indexOf(signerAddress);
  if (slotIndex < 0 || slotIndex >= numRequiredSigners) {
    return -1;
  }
  return slotIndex;
}
