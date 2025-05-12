"use client";

import * as solanaNetwork from "../solanaNetwork.js";
import { useMutation } from "@tanstack/react-query";
import { SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types.js";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { getSolanaConnection, watchSolanaConnection } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { PromiseOrValue } from "../../../../aa-sdk/core/dist/types/types.js";

/** Used right before we send the transaction out, this is going to be the signer. */
export type PreSend = (
  this: void,
  transaction: VersionedTransaction | Transaction
) => PromiseOrValue<VersionedTransaction | Transaction>;
/**
 * Used in the sendTransaction, will transform either the instructions (or the transfer -> instructions) into a transaction
 */
export type TransformInstruction = (
  this: void,
  instructions: TransactionInstruction[]
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
    }
  | {
      instructions: TransactionInstruction[];
      transactionComponents?: SolanaTransactionParamOptions;
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
    params: SolanaTransactionParams
  ): Promise<{ hash: string }>;
}

/**
 * The parameters for the useSolanaTransaction hook.
 */
export type SolanaTransactionHookParams = {
  signer?: SolanaSigner;
  connection?: solanaNetwork.Connection;
  policyId?: string | void;
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
  opts: SolanaTransactionHookParams = {}
): SolanaTransaction {
  const { config } = useAlchemyAccountContext();
  const fallbackSigner: null | SolanaSigner = useSolanaSigner();
  const backupConnection = useSyncExternalStore(
    watchSolanaConnection(config),
    () => getSolanaConnection(config),
    () => getSolanaConnection(config)
  );
  const mutation = useMutation({
    mutationFn: async ({
      transactionComponents: {
        preSend,
        transformInstruction = mapTransformInstructions.default,
      } = {},
      ...params
    }: SolanaTransactionParams) => {
      const instructions = getInstructions();
      let transaction: VersionedTransaction | Transaction =
        await transformInstruction(instructions);

      transaction = (await preSend?.(transaction)) || transaction;

      if (needsSignerToSign()) {
        await signer?.addSignature(transaction);
      }

      const localConnection = connection || missing("connection");
      const hash = await solanaNetwork.broadcast(localConnection, transaction);
      return { hash };

      function getInstructions() {
        if ("instructions" in params) {
          return params.instructions;
        }
        return [
          SystemProgram.transfer({
            fromPubkey: new PublicKey(
              signer?.address || missing("signer.address")
            ),
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
              key.toBase58() === signer?.address &&
              message?.isAccountSigner(index)
          );
        }
        return transaction.instructions.some((x) =>
          x.keys.some(
            (x) => x.pubkey.toBase58() === signer?.address && x.isSigner
          )
        );
      }
    },
    ...opts.mutation,
  });
  const signer: null | SolanaSigner = opts?.signer || fallbackSigner;
  const connection = opts?.connection || backupConnection?.connection || null;
  const policyId =
    "policyId" in opts ? opts.policyId : backupConnection?.policyId;
  const mapTransformInstructions: Record<string, TransformInstruction> = {
    async addSponsorship(instructions: TransactionInstruction[]) {
      return await (signer || missing("signer")).addSponsorship(
        instructions,
        connection || missing("connection"),
        policyId || missing("policyId")
      );
    },
    async createTransaction(instructions: TransactionInstruction[]) {
      return await (signer || missing("signer")).createTransaction(
        instructions,
        connection || missing("connection")
      );
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
