"use client";

import * as solanaNetwork from "../solanaNetwork.js";
import { useMutation } from "@tanstack/react-query";
import { SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types.js";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { getSolanaConnection, watchSolanaConnection } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

export type SolanaTransactionParams =
  | {
      transfer: {
        amount: number;
        toAddress: string;
      };
    }
  | {
      instructions: TransactionInstruction[];
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
  mutate(params: SolanaTransactionParams): void;
  /** Send the transaction asynchronously */
  mutateAsync(params: SolanaTransactionParams): Promise<{ hash: string }>;
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
  opts: SolanaTransactionHookParams
): SolanaTransaction {
  const { config } = useAlchemyAccountContext();
  const fallbackSigner: null | SolanaSigner = useSolanaSigner();
  const backupConnection = useSyncExternalStore(
    watchSolanaConnection(config),
    () => getSolanaConnection(config),
    () => getSolanaConnection(config)
  );
  const mutation = useMutation({
    mutationFn: async (params: SolanaTransactionParams) => {
      if (!signer) throw new Error("Not ready");
      if (!connection) throw new Error("Not ready");
      const instructions =
        "instructions" in params
          ? params.instructions
          : [
              SystemProgram.transfer({
                fromPubkey: new PublicKey(signer.address),
                toPubkey: new PublicKey(params.transfer.toAddress),
                lamports: params.transfer.amount,
              }),
            ];
      const policyId =
        "policyId" in opts ? opts.policyId : backupConnection?.policyId;
      const transaction = policyId
        ? await signer.addSponsorship(instructions, connection, policyId)
        : await signer.createTransfer(instructions, connection);

      await signer.addSignature(transaction);

      const hash = await solanaNetwork.broadcast(connection, transaction);
      return { hash };
    },
    ...opts.mutation,
  });
  const signer: null | SolanaSigner = opts?.signer || fallbackSigner;
  const connection = opts?.connection || backupConnection?.connection || null;

  return {
    connection,
    signer,
    ...mutation,
  };
}
