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

export interface ConfirmationOptions {
  /**
   * Whether to use polling instead of WebSocket subscriptions for transaction confirmation.
   * Useful for environments where WebSocket connections are unreliable (e.g., React Native).
   *
   * @default false
   */
  enablePolling?: boolean;
  pollingInterval?: number;
  maxPollingAttempts?: number;
  commitment?: "processed" | "confirmed" | "finalized";
}

export async function balance(
  connection: Connection,
  address: string,
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
  solanaAddress: string,
) {
  const publicKey = new PublicKey(solanaAddress);

  console.log(`Dropping 1 SOL into ${solanaAddress}...`);

  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    LAMPORTS_PER_SOL,
  );
  const confirmationStrategy = await getConfirmationStrategy(
    connection,
    airdropSignature,
  );

  return await connection.confirmTransaction(confirmationStrategy);
}

export async function broadcast(
  connection: Connection,
  signedTransaction: Transaction | VersionedTransaction,
  options: ConfirmationOptions = {},
) {
  const {
    enablePolling = false,
    pollingInterval = 1000,
    maxPollingAttempts = 30,
    commitment = "confirmed",
  } = options;

  const signature =
    "version" in signedTransaction
      ? signedTransaction.signatures[0]!
      : signedTransaction.signature!;

  if (enablePolling) {
    return await broadcastWithPolling(
      connection,
      signedTransaction,
      pollingInterval,
      maxPollingAttempts,
      commitment,
    );
  } else {
    const confirmationStrategy = await getConfirmationStrategy(
      connection,
      bs58.encode(signature),
    );
    const transactionHash = await sendAndConfirmRawTransaction(
      connection,
      Buffer.from(signedTransaction.serialize()),
      confirmationStrategy,
      { commitment },
    );

    return transactionHash;
  }
}

async function broadcastWithPolling(
  connection: Connection,
  signedTransaction: Transaction | VersionedTransaction,
  pollingInterval: number,
  maxPollingAttempts: number,
  commitment: "processed" | "confirmed" | "finalized",
): Promise<string> {
  const txSignature =
    "version" in signedTransaction
      ? await connection.sendTransaction(signedTransaction)
      : await connection.sendRawTransaction(signedTransaction.serialize());

  for (let attempt = 0; attempt < maxPollingAttempts; attempt++) {
    try {
      const status = await connection.getSignatureStatus(txSignature);

      if (status.value?.confirmationStatus) {
        const confirmationStatus = status.value.confirmationStatus;

        const isConfirmed =
          commitment === "processed" ||
          (commitment === "confirmed" &&
            (confirmationStatus === "confirmed" ||
              confirmationStatus === "finalized")) ||
          (commitment === "finalized" && confirmationStatus === "finalized");

        if (isConfirmed) {
          if (status.value.err) {
            throw new Error(
              `Transaction failed: ${JSON.stringify(status.value.err)}`,
            );
          }
          return txSignature;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    } catch (pollError) {
      console.log(`Polling attempt ${attempt + 1} failed:`, pollError);
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }
  }

  throw new Error(
    `Transaction confirmation timed out after ${maxPollingAttempts} attempts. ` +
      `Transaction may still be processed. Signature: ${txSignature}`,
  );
}

export async function recentBlockhash(connection: Connection): Promise<string> {
  const blockhash = await connection.getLatestBlockhash();
  return blockhash.blockhash;
}

export async function getConfirmationStrategy(
  connection: Connection,
  signature: string,
): Promise<TransactionConfirmationStrategy> {
  const latestBlockHash = await connection.getLatestBlockhash();

  return {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  };
}
