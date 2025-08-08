import type { TransactionInstruction } from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * This function wraps instructions in a sponsored transaction using Alchemy's fee payer service
 *
 * @param {TransactionInstruction[]} instructions - The instructions to add sponsorship to
 * @param {Connection} connection - The connection to use
 * @param {string} policyId - The policy id to use
 * @param {string} address - The address to use
 * @returns {Promise<VersionedTransaction>} - The sponsored transaction
 */
export async function createSolanaSponsoredTransaction(
  instructions: TransactionInstruction[],
  connection: Connection,
  policyId: string,
  address: string,
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash({
    commitment: "finalized",
  });
  const message = new TransactionMessage({
    // Right now the backend will rewrite this payer Key to the server's address
    payerKey: new PublicKey(address),
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const versionedTransaction = new VersionedTransaction(message);
  const serializedTransaction = Buffer.from(
    versionedTransaction.serialize(),
  ).toString("base64");
  const body = JSON.stringify({
    id: crypto?.randomUUID() ?? Math.floor(Math.random() * 1000000),
    jsonrpc: "2.0",
    method: "alchemy_requestFeePayer",
    params: [
      {
        policyId,
        serializedTransaction,
      },
    ],
  });
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body,
  };

  const response = await fetch(
    // TODO: Use the connection??
    connection.rpcEndpoint,
    options,
  );
  const jsonResponse = await response.json();
  if (!jsonResponse?.result?.serializedTransaction)
    throw new Error(
      `Response doesn't include the serializedTransaction ${JSON.stringify(
        jsonResponse,
      )}`,
    );
  return VersionedTransaction.deserialize(
    decodeBase64(jsonResponse.result.serializedTransaction),
  );
}

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

function decodeBase64(serializedTransaction: string): Uint8Array {
  return Buffer.from(serializedTransaction, "base64");
}
