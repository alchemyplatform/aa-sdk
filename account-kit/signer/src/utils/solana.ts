import type { TransactionInstruction } from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * This function wraps instructions in a sponsored transaction
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
    Buffer.from(jsonResponse.result.serializedTransaction, "base64"),
  );
}
