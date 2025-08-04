"use client";

import { useMutation } from "@tanstack/react-query";
import { toBytes, toHex, type ByteArray, type Hex } from "viem";
import { useWallet } from "@solana/wallet-adapter-react";
import type { SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types";
import { useSolanaSigner } from "./useSolanaSigner.js";

export type MutationParams = {
  message: string | ByteArray;
};
/**
 * There are cases where we might want to sign a message, used for other
 * messages or anything else. A use case would be sign something for audit reasons?
 *
 * Uses the useMutation for the return type plus a few more.
 *
 * @see {@link useSolanaTransaction}
 * @see {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation | TanStack Query useMutation}
 */
export interface SolanaSignedMessage {
  readonly signer: SolanaSigner | null;
  readonly data: Hex | undefined;
  readonly isPending: boolean;
  readonly error: Error | null;
  reset(): void;
  signMessage(args: MutationParams): void;
  signMessageAsync(args: MutationParams): Promise<Hex>;
}

/**
 * The parameters for the useSolanaSignMessage hook.
 */
export type UseSolanaSignMessageParams = {
  signer?: SolanaSigner;
  /**
   * Override the default mutation options
   *
   * @see {@link BaseHookMutationArgs}
   */
  mutation?: BaseHookMutationArgs<Hex, MutationParams>;
};

/**
 * This is the hook that will be used to sign a message. It will prioritize external
 * connected Solana wallets, falling back to the internal signer when not connected.
 *
 * @example
 * ```ts
 * const {
 *   isPending: isSigningMessage,
 *   mutate: signHello,
 *   data: signature,
 *   reset,
 * } = useSolanaSignMessage({
 * });
 * mutate({ message: "Hello" });
 * ```
 * @param {UseSolanaSignMessageParams} opts - Options for the hook to get setup.
 * @returns {SolanaSignedMessage} This should be hook mutations plus a few more. Used to get the end result of the signing and the callbacks.
 */
export function useSolanaSignMessage(
  opts: UseSolanaSignMessageParams,
): SolanaSignedMessage {
  const fallbackSigner = useSolanaSigner({});
  const { connected: isWalletConnected, signMessage: walletSignMessage } =
    useWallet();
  const signer = opts.signer || fallbackSigner;

  const mutation = useMutation({
    mutationFn: async (args: MutationParams) => {
      const messageBytes =
        typeof args.message === "string" ? toBytes(args.message) : args.message;

      // Use external wallet if connected
      if (isWalletConnected && walletSignMessage) {
        try {
          const signature = await walletSignMessage(messageBytes);
          return toHex(signature);
        } catch (error) {
          throw new Error(`External wallet signing failed: ${error}`);
        }
      }

      // Fall back to internal signer
      if (!signer) {
        throw new Error(
          "No Solana wallet connected and no internal signer available",
        );
      }

      return await signer.signMessage(messageBytes).then(toHex);
    },
    ...opts.mutation,
  });

  return {
    signer,
    ...mutation,
    signMessage: mutation.mutate,
    signMessageAsync: mutation.mutateAsync,
  };
}
