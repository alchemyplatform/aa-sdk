import {
  PublicKey,
  Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";
import { size, slice, toBytes, toHex, type ByteArray, type Hex } from "viem";
import type { BaseSignerClient } from "./client/base";
import { NotAuthenticatedError } from "./errors.js";

// TODO: I don't want this to be a class so that the flow is closer to how we do this for `toViemAccount`
export class SolanaSigner {
  private alchemyClient: BaseSignerClient;
  public address: string;

  constructor(client: BaseSignerClient) {
    this.alchemyClient = client;
    if (!client.getUser()) throw new Error("Must be authenticated!");

    // TODO: also throw here
    this.address = client.getUser()!.solanaAddress!;
  }

  async addSignature(
    tx: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> {
    const user = this.alchemyClient.getUser();
    if (!user) {
      throw new NotAuthenticatedError();
    }

    if (!user.solanaAddress) {
      throw new Error("no solana address");
    }

    const fromKey = new PublicKey(user.solanaAddress);
    const messageToSign = this.getMessageToSign(tx);
    const signature = await this.alchemyClient.signRawMessage(
      messageToSign,
      "SOLANA"
    );

    tx.addSignature(
      fromKey,
      Buffer.from(toBytes(this.formatSignatureForSolana(signature)))
    );
    return tx;
  }

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
      "SOLANA"
    );

    return toBytes(this.formatSignatureForSolana(signature));
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
