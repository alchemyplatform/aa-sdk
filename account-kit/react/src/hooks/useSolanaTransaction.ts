"use client";

import * as solanaNetwork from "../solanaNetwork.js";
import { useMutation } from "@tanstack/react-query";
import { createSolanaSponsoredTransaction, SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types.js";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { getSolanaConnection, watchSolanaConnection } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { PromiseOrValue } from "../../../../aa-sdk/core/dist/types/types.js";
import { useWallet } from "@solana/wallet-adapter-react";

/** Used right before we send the transaction out, this is going to be the signer. */
export type PreSend = (
  this: void,
  transaction: VersionedTransaction | Transaction,
) => PromiseOrValue<VersionedTransaction | Transaction>;
/**
 * Used in the sendTransaction, will transform either the instructions (or the transfer -> instructions) into a transaction
 */
export type TransformInstruction = (
  this: void,
  instructions: TransactionInstruction[],
) => PromiseOrValue<Transaction | VersionedTransaction>;
export type SolanaTransactionParamOptions = {
  preSend?: PreSend;
  transformInstruction?: TransformInstruction;
};
export type SolanaTransactionParams =
  | {
      transfer: {
        amount: number;
        toAddress: string;
      };
      transactionComponents?: SolanaTransactionParamOptions;
      confirmationOptions?: solanaNetwork.ConfirmationOptions;
    }
  | {
      instructions: TransactionInstruction[];
      transactionComponents?: SolanaTransactionParamOptions;
      confirmationOptions?: solanaNetwork.ConfirmationOptions;
    };
/**
 * We wanted to make sure that this will be using the same useMutation that the
 * useSendUserOperation does.
 * We are going to flatten it to make sure that we are abstracting it, and that we have
 * the flattened version here for readability.
 *
 * @see {@link useSendUserOperation}
 * @see {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation | TanStack Query useMutation}
 */
export interface SolanaTransaction {
  /** The solana signer used to send the transaction */
  readonly signer: SolanaSigner | null;
  /** The solana connection used to send the transaction */
  readonly connection: solanaNetwork.Connection | null;
  /** The result of the transaction */
  readonly data: void | { hash: string };
  /** Is the use sending a transaction */
  readonly isPending: boolean;
  /** The error that occurred */
  readonly error: Error | null;
  reset(): void;
  /** Send the transaction */
  sendTransaction(params: SolanaTransactionParams): void;
  /** Send the transaction asynchronously */
  sendTransactionAsync(
    params: SolanaTransactionParams,
  ): Promise<{ hash: string }>;
}

/**
 * The parameters for the useSolanaTransaction hook.
 */
export type SolanaTransactionHookParams = {
  signer?: SolanaSigner;
  connection?: solanaNetwork.Connection;
  policyId?: string | void;
  confirmationOptions?: solanaNetwork.ConfirmationOptions;
  /**
   * Override the default mutation options
   *
   * @see {@link BaseHookMutationArgs}
   */
  mutation?: BaseHookMutationArgs<{ hash: string }, SolanaTransactionParams>;
};

/**
 * This is the hook that will be used to send a transaction.
 *
 * @example
 * ```ts
  const {mutate} = useSolanaTransaction({
    policyId: "<policyId>",
});
 
mutate({
  transfer: {
    amount: <amount:number>,
    toAddress: "<toAddress>",
  },
 * ```
 * @param {SolanaTransactionHookParams} opts Options for the hook to get setup, The transaction is required.
 * @returns {SolanaTransaction} The transaction hook.
 */
export function useSolanaTransaction(
  opts: SolanaTransactionHookParams = {},
): SolanaTransaction {
  const { config } = useAlchemyAccountContext();
  const fallbackSigner: null | SolanaSigner = useSolanaSigner();
  const backupConnection = useSyncExternalStore(
    watchSolanaConnection(config),
    () => getSolanaConnection(config),
    () => getSolanaConnection(config),
  );

  const {
    connected: eoaConnected,
    signTransaction: eoaSignTransaction,
    publicKey,
  } = useWallet();

  const mutation = useMutation({
    mutationFn: async ({
      transactionComponents: {
        preSend,
        transformInstruction = mapTransformInstructions.default,
      } = {},
      confirmationOptions,
      ...params
    }: SolanaTransactionParams) => {
      const instructions = getInstructions();
      let transaction: VersionedTransaction | Transaction =
        await transformInstruction(instructions);

      transaction = (await preSend?.(transaction)) || transaction;

      if (needsSignerToSign()) {
        if (eoaConnected && eoaSignTransaction) {
          console.log("eoaSignTransaction");
          transaction = await eoaSignTransaction(transaction);
        } else {
          await signer?.addSignature(transaction);
        }
      }

      const localConnection = connection || missing("connection");

      const finalConfirmationOptions = {
        ...opts.confirmationOptions,
        ...confirmationOptions,
      };

      const hash = await solanaNetwork.broadcast(
        localConnection,
        transaction,
        finalConfirmationOptions,
      );
      return { hash };

      function getInstructions() {
        if ("instructions" in params) {
          return params.instructions;
        }
        return [
          SystemProgram.transfer({
            fromPubkey: new PublicKey(address ?? missing("address")),
            toPubkey: new PublicKey(params.transfer.toAddress),
            lamports: params.transfer.amount,
          }),
        ];
      }

      function needsSignerToSign() {
        if ("message" in transaction) {
          const message = transaction.message;
          return message.staticAccountKeys.some(
            (key, index) =>
              key.toBase58() === address && message?.isAccountSigner(index),
          );
        }
        return transaction.instructions.some((x) =>
          x.keys.some((x) => x.pubkey.toBase58() === address && x.isSigner),
        );
      }
    },
    ...opts.mutation,
  });
  const signer: null | SolanaSigner = opts?.signer || fallbackSigner;
  const address = signer?.address || publicKey?.toString();
  const connection = opts?.connection || backupConnection?.connection || null;
  const policyId =
    "policyId" in opts ? opts.policyId : backupConnection?.policyId;
  const mapTransformInstructions: Record<string, TransformInstruction> = {
    async addSponsorship(instructions: TransactionInstruction[]) {
      return await createSolanaSponsoredTransaction(
        instructions,
        connection || missing("connection"),
        policyId || missing("policyId"),
        address ?? missing("address"),
      );
    },
    async createTransaction(instructions: TransactionInstruction[]) {
      const blockhash = (
        await (connection ?? missing("connection")).getLatestBlockhash()
      ).blockhash;

      const txMessage = new TransactionMessage({
        payerKey: new PublicKey(address ?? missing("address")),
        recentBlockhash: blockhash,
        instructions,
      });

      const versionedTxMessage = txMessage.compileToV0Message();
      const transferTransaction = new VersionedTransaction(versionedTxMessage);

      return transferTransaction;
    },
    get default() {
      return policyId
        ? mapTransformInstructions.addSponsorship
        : mapTransformInstructions.createTransaction;
    },
  };

  return {
    connection,
    signer,
    ...mutation,
    sendTransaction: mutation.mutate,
    sendTransactionAsync: mutation.mutateAsync,
  };
}

function missing(message: string): never {
  throw new Error(message);
}
