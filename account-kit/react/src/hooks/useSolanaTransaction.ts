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
 * ```tsx twoslash
 * import React from "react";
 * import { useSolanaTransaction } from "@account-kit/react";
 * import { Connection } from "@solana/web3.js";
 * 
 * function MyComponent() {
 *   const connection = new Connection(
 *     "https://solana-devnet.g.alchemy.com/v2/<API_KEY>",
 *     {
 *       wsEndpoint: "wss://api.devnet.solana.com",
 *       commitment: "confirmed",
 *     }
 *   );
 *   const policyId = "<policyId>";
 * 
 *   const {
 *     mutate: doTransaction,
 *     isPending,
 *     signer,
 *     reset,
 *     data: { hash: txHash = null } = {},
 *   } = useSolanaTransaction({
 *     connection,
 *     // Used if we have a alchemy sponsor
 *     policyId,
 *   });
 
 *   if (!signer) {
 *     return <div>Loading alchemy signer...</div>;
 *   }
 
 *   return (
 *     <div>
 *       Solana Address: { signer.address }
 *       <button
 *         onClick={() =>
 *           doTransaction({
 *             transfer: {
 *               amount: 1000000,
 *               toAddress: "<ToSolanaAddress>",
 *             },
 *           })
 *         }
 *       >Go make Transfer</button>
 *       {
 *         !!txHash &&
 *         <button onClick={() => reset()}>Reset</button>
 *       }
 *       { !!txHash && <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank">Go To Tracker</a> }
 *    </div>
 *  );
 * }
 * ``` 
 * 
 * This hook:
 * 
 * - Signs the transaction and broadcasts it to the network via the Connection passed in
 * - Returns a mutate to fire and forget a transaction, either a transfer or list of web3 instructions
 * - Provides the state for the result of the txHash that results after the broadcast
 * - Has an isPending to know if the transaction is currently sending
 * - Has the signer, so we can see if we had provided an alchemy signer in the app. (A signer could have been passed in instead of provided)
 * - Has other onMutation hooks that could be passed in as the mutation: argument for the hook
 * 
 * Note: This example assumes that the alchemy signer is defined higher up in the React tree. If this is not the case this transaction will not work. Instead, one could pass down the signer as a parameter for the hook
 * Note: This example uses the connection passed in, but there is a AlchemySolanaWeb3Context if we would like do input as a provider.
 * 
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
