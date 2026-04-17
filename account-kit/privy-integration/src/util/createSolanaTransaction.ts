import type { TransactionInstruction } from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Creates a regular (non-sponsored) Solana transaction from instructions
 *
 * @param {TransactionInstruction[]} instructions - The instructions to create transaction from
 * @param {Connection} connection - The connection to use
 * @param {string} address - The payer address
 * @returns {Promise<VersionedTransaction>} - The transaction
 */
export async function createSolanaTransaction(
  instructions: TransactionInstruction[],
  connection: Connection,
  address: string,
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash({
    commitment: "finalized",
  });
  const message = new TransactionMessage({
    payerKey: new PublicKey(address),
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(message);
}
