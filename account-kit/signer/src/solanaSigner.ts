import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { size, slice, toBytes, toHex, type ByteArray, type Hex } from "viem";
import type { BaseSignerClient } from "./client/base";
import { NotAuthenticatedError } from "./errors.js";
import { createSolanaSponsoredTransaction } from "./utils/solana.js";

/**
 * The SolanaSigner class is used to sign transactions and messages for the Solana blockchain.
 * It provides methods to add signatures to transactions and sign messages.
 */
export class SolanaSigner {
  readonly alchemyClient: BaseSignerClient;
  public readonly address: string;

  /**
   * Constructor for the SolanaSigner class which is a wrapper around the alchemy client, and is more focused on the solana web3
   *
   * @param {object} client This is the client that will be used to sign the transaction, and we are just having functions on top of it.
   */
  constructor(client: BaseSignerClient) {
    this.alchemyClient = client;
    if (!client.getUser()) throw new Error("Must be authenticated!");

    // TODO: also throw here
    this.address = client.getUser()!.solanaAddress!;
  }

  /**
   * Adds a signature of the client user to a transaction
   *
   * @param {Transaction | VersionedTransaction} transaction - The transaction to add the signature to
   * @returns {Promise<Transaction | VersionedTransaction >} The transaction with the signature added
   */
  async addSignature(
    transaction: Transaction | VersionedTransaction,
  ): Promise<Transaction | VersionedTransaction> {
    const user = this.alchemyClient.getUser();
    if (!user) {
      throw new NotAuthenticatedError();
    }

    if (!user.solanaAddress) {
      throw new Error("no solana address");
    }

    const fromKey = new PublicKey(user.solanaAddress);
    const messageToSign = this.getMessageToSign(transaction);
    const signature = await this.alchemyClient.signRawMessage(
      messageToSign,
      "SOLANA",
    );

    transaction.addSignature(
      fromKey,
      Buffer.from(toBytes(this.formatSignatureForSolana(signature))),
    );
    return transaction;
  }

  /**
   * Signs a message
   *
   * @param {Uint8Array} message - The message to sign
   * @returns {Promise<ByteArray>} The signature of the message
   */
  async signMessage(message: Uint8Array): Promise<ByteArray> {
    const user = this.alchemyClient.getUser();
    if (!user) {
      throw new NotAuthenticatedError();
    }

    if (!user.solanaAddress) {
      throw new Error("no solana address");
    }

    const messageToSign = toHex(message);
    const signature = await this.alchemyClient.signRawMessage(
      messageToSign,
      "SOLANA",
    );

    return toBytes(this.formatSignatureForSolana(signature));
  }

  async createTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    version?: "versioned",
  ): Promise<VersionedTransaction>;
  async createTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    version?: "legacy",
  ): Promise<Transaction>;
  async createTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
  ): Promise<VersionedTransaction>;

  /**
   * Creates a transfer transaction. Used for the SolanaCard example.
   *
   * @param {TransactionInstruction[]} instructions - The instructions to add to the transaction
   * @param {Connection} connection - The connection to use for the transaction
   * @param {"versioned" | "legacy"} [version] - The version of the transaction
   * @returns {Promise<Transaction | VersionedTransaction>} The transfer transaction
   */
  async createTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    version?: string,
  ): Promise<Transaction | VersionedTransaction> {
    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    let transferTransaction;

    if (version === "legacy") {
      // Legacy transaction
      transferTransaction = instructions.reduce(
        (tx, instruction) => tx.add(instruction),
        new Transaction(),
      );

      // Get a recent block hash
      transferTransaction.recentBlockhash = blockhash;
      // Set the signer
      transferTransaction.feePayer = new PublicKey(this.address);
    } else {
      // VersionedTransaction
      const txMessage = new TransactionMessage({
        payerKey: new PublicKey(this.address),
        recentBlockhash: blockhash,
        instructions,
      });

      const versionedTxMessage = txMessage.compileToV0Message();
      transferTransaction = new VersionedTransaction(versionedTxMessage);
    }

    return transferTransaction;
  }

  /**
   * Adds sponsorship to a transaction. Used to have a party like Alchemy pay for the transaction.
   *
   * @param {TransactionInstruction[]} instructions - The instructions to add to the transaction
   * @param {Connection} connection - The connection to use for the transaction
   * @param {string} [policyId] - The policy ID to add sponsorship to
   * @returns {Promise<VersionedTransaction>} The transaction with sponsorship added
   */
  async addSponsorship(
    instructions: TransactionInstruction[],
    connection: Connection,
    policyId: string,
  ): Promise<VersionedTransaction> {
    return createSolanaSponsoredTransaction(
      instructions,
      connection,
      policyId,
      this.address,
    );
  }

  private formatSignatureForSolana(signature: Hex): Hex {
    if (size(signature) === 64) return signature;

    return slice(signature, 0, 64);
  }

  private getMessageToSign(tx: Transaction | VersionedTransaction): Hex {
    let messageToSign;
    if (tx instanceof Transaction) {
      messageToSign = tx.serializeMessage();
    } else {
      messageToSign = Buffer.from(tx.message.serialize());
    }
    return toHex(messageToSign);
  }
}
