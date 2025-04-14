import { useMutation } from "@tanstack/react-query";
import { toBytes, toHex, type Hex } from "viem";
import type { SolanaSigner } from "@account-kit/signer";
import type { BaseHookMutationArgs } from "../types";
import { useSolanaSigner } from "./useSolanaSigner.js";

/**
 * There are cases where we might want to sign a message, used for other
 * messages or anything else. A use case would be sign something for audit reasons?
 *
 * Uses the useMutation for the return type plus a few more.
 *
 * @see {@link useSolanaTransaction}
 * @see {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation | TanStack Query useMutation}
 */
export interface SolanaMessageSigned {
  readonly signer: SolanaSigner | void;
  readonly data: Hex | undefined;
  readonly isPending: boolean;
  readonly error: Error | null;
  reset(): void;
  mutate(): void;
  mutateAsync(): Promise<Hex>;
}

/**
 * The parameters for the useSolanaMessageSigned hook.
 */
export type UseSolanaMessageSignedParams = {
  message: string;
  signer?: SolanaSigner;
  /**
   * Override the default mutation options
   *
   * @see {@link BaseHookMutationArgs}
   */
  mutation?: BaseHookMutationArgs<Hex>;
};

/**
 * This is the hook that will be used to sign a message. And have the mutation, which would
 * be the end result and the callbacks to modify
 *
 * @example
 * ```ts
 * const {
 *   isPending: isSigningMessage,
 *   mutate: signHello,
 *   data: signature,
 *   reset,
 * } = useSolanaMessageSigned({
 *   message: "Hello",
 * });
 * ```
 * @param {UseSolanaMessageSignedParams} opts - Options for the hook to get setup.
 * @returns {SolanaMessageSigned} This should be hook mutations plus a few more. Used to get the end result of the signing and the callbacks.
 */
export function useSolanaMessageSigned(
  opts: UseSolanaMessageSignedParams
): SolanaMessageSigned {
  const fallbackSigner = useSolanaSigner({});
  const signer = opts.signer || fallbackSigner;
  const mutation = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error("Not ready");
      return await signer.signMessage(toBytes(opts.message)).then(toHex);
    },
    ...opts.mutation,
  });

  return {
    signer,
    ...mutation,
  };
}
