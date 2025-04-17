import * as solanaNetwork from "../solanaNetwork.js";
import { useMutation } from "@tanstack/react-query";
import { SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { useContext } from "react";
import { AlchemySolanaWeb3Context } from "../AlchemySolanaWeb3Context.js";
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
  mutate(): void;
  /** Send the transaction asynchronously */
  mutateAsync(): Promise<{ hash: string }>;
}

/**
 * The parameters for the useSolanaTransaction hook.
 */
export type SolanaTransactionParams = {
  transaction: {
    amount: number;
    toAddress: string;
  };
  signer?: SolanaSigner;
  connection?: solanaNetwork.Connection;
  policyId?: string;
  /**
   * Override the default mutation options
   *
   * @see {@link BaseHookMutationArgs}
   */
  mutation?: BaseHookMutationArgs<{ hash: string }>;
};

/**
 * This is the hook that will be used to send a transaction.
 *
 * @example
 * ```ts
  useSolanaTransaction({
    policyId: "<policyId>",
    transaction: {
      amount: 1000000,
      toAddress: "<toAddress>",
    },
});
 * ```
 * @param {SolanaTransactionParams} opts Options for the hook to get setup, The transaction is required.
 * @returns {SolanaTransaction} The transaction hook.
 */
export function useSolanaTransaction(
  opts: SolanaTransactionParams
): SolanaTransaction {
  const web3Context = useContext(AlchemySolanaWeb3Context);
  const fallbackSigner = useSolanaSigner({});
  const mutation = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error("Not ready");
      if (!connection) throw new Error("Not ready");
      const instructions = [
        SystemProgram.transfer({
          fromPubkey: new PublicKey(signer.address),
          toPubkey: new PublicKey(opts.transaction.toAddress),
          lamports: opts.transaction.amount,
        }),
      ];
      const policyId =
        "policyId" in opts ? opts.policyId : web3Context?.policyId;
      const transaction = policyId
        ? await signer.addSponsorship(instructions, connection, policyId)
        : await signer.createTransfer(instructions, connection);

      await signer.addSignature(transaction);

      const hash = await solanaNetwork.broadcast(connection, transaction);
      return { hash };
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
