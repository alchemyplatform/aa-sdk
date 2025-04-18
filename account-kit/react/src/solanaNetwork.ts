import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  type TransactionConfirmationStrategy,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

export { Connection };

export async function balance(
  connection: Connection,
  address: string
): Promise<number> {
  const publicKey = new PublicKey(address);

  return await connection.getBalance(publicKey);
}

/**
 * NOTE: this doesn't work because the devnet address giving solana doesn't have the funds to
 * airdrop 1 SOL. (at the time of writing)
 *
 * @param {Connection} connection The Solana connection instance
 * @param {string} solanaAddress The Solana address to receive the airdrop
 * @returns {Promise<TransactionSignature>} The transaction confirmation result
 */
export async function dropTokens(
  connection: Connection,
  solanaAddress: string
) {
  const publicKey = new PublicKey(solanaAddress);

  console.log(`Dropping 1 SOL into ${solanaAddress}...`);

  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    LAMPORTS_PER_SOL
  );
  const confirmationStrategy = await getConfirmationStrategy(
    connection,
    airdropSignature
  );

  return await connection.confirmTransaction(confirmationStrategy);
}

export async function broadcast(
  connection: Connection,
  signedTransaction: Transaction | VersionedTransaction
) {
  const signature =
    "version" in signedTransaction
      ? signedTransaction.signatures[0]!
      : signedTransaction.signature!;

  const confirmationStrategy = await getConfirmationStrategy(
    connection,
    bs58.encode(signature)
  );
  const transactionHash = await sendAndConfirmRawTransaction(
    connection,
    Buffer.from(signedTransaction.serialize()),
    confirmationStrategy,
    { commitment: "confirmed" }
  );

  return transactionHash;
}

export async function recentBlockhash(connection: Connection): Promise<string> {
  const blockhash = await connection.getLatestBlockhash();
  return blockhash.blockhash;
}

export async function getConfirmationStrategy(
  connection: Connection,
  signature: string
): Promise<TransactionConfirmationStrategy> {
  const latestBlockHash = await connection.getLatestBlockhash();

  return {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  };
}
