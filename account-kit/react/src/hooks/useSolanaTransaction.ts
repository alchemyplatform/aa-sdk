import * as solanaNetwork from "../solanaNetwork.js";
import { useMutation } from "@tanstack/react-query";
import { SolanaPipe, SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { useContext } from "react";
import { AlchemySolanaWeb3Context } from "../AlchemySolanaWeb3Context.js";

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
  readonly signer: SolanaSigner | void;
  /** The solana connection used to send the transaction */
  readonly connection: solanaNetwork.Connection | void;
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
  policyId?: string;
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
  const web3Context = useContext(AlchemySolanaWeb3Context);
  const fallbackSigner = useSolanaSigner({});
  const mutation = useMutation({
    mutationFn: async (params: SolanaTransactionParams) => {
      if (!signer) throw new Error("Not ready");
      if (!connection) throw new Error("Not ready");

      const policyId =
        "policyId" in opts ? opts.policyId : web3Context?.policyId;

      const pipe_ = SolanaPipe.fromSolanaSigner(signer);

      const pipe__ = policyId ? pipe_.withAlchemySponsorship(policyId) : pipe_;
      const pipe =
        "instructions" in params
          ? pipe__.withInstructions(params.instructions)
          : pipe__.withTransfer({
              lamports: params.transfer.amount,
              toPubkey: new PublicKey(params.transfer.toAddress),
            });

      return { hash: await pipe.broadcast(connection) };
    },
    ...opts.mutation,
  });
  const signer: void | SolanaSigner = opts?.signer || fallbackSigner;
  const connection = opts?.connection || web3Context?.connection;

  return {
    connection,
    signer,
    ...mutation,
  };
}
