"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { signMessage as wagmi_signMessage } from "@wagmi/core";
import { useCallback } from "react";
import type { Hex, SignableMessage } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import { ReactLogger } from "../metrics.js";
import type { BaseHookMutationArgs } from "../types.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type SignMessageArgs = { message: SignableMessage };

export type UseSignMessagedMutationArgs = BaseHookMutationArgs<
  Hex,
  SignMessageArgs
>;

export type UseSignMessageArgs = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseSignMessagedMutationArgs;

export type UseSignMessageResult = {
  signMessage: UseMutateFunction<Hex, Error, SignMessageArgs, unknown>;
  signMessageAsync: UseMutateAsyncFunction<
    Hex,
    Error,
    SignMessageArgs,
    unknown
  >;
  signedMessage: Hex | undefined;
  isSigningMessage: boolean;
  error: Error | null;
};

/**
 * Custom hook to sign a message using the provided client.
 *
 * @example
 * ```ts
 * import { useSignMessage, useSmartAccountClient } from "@account-kit/react";
 *
 * const { client } = useSmartAccountClient({ type: "LightAccount" });
 * const { signMessage, signMessageAsync, signedMessage, isSigningMessage, error } = useSignMessage({
 *  client,
 *  // these are optional
 *  onSuccess: (result) => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
 *
 * @param {UseSignMessageArgs} config The configuration arguments for the hook, including the client and additional mutation arguments
 * @returns {UseSignMessageResult} An object containing methods and state for signing messages
 */
export function useSignMessage({
  client,
  ...mutationArgs
}: UseSignMessageArgs): UseSignMessageResult {
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();

  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const mutationFn = useCallback(
    async (params: SignMessageArgs) => {
      if (isConnected) {
        return wagmi_signMessage(wagmiConfig, params);
      }

      if (!client) {
        throw new ClientUndefinedHookError("useSignMessage");
      }

      return client.signMessage(params);
    },
    [client, isConnected, wagmiConfig]
  );

  const {
    mutate: signMessage,
    mutateAsync: signMessageAsync,
    data: signedMessage,
    isPending: isSigningMessage,
    error,
  } = useMutation(
    {
      mutationKey: ["signMessage"],
      mutationFn,
      ...mutationArgs,
    },
    queryClient
  );

  return {
    signMessage: ReactLogger.profiled("signMessage", signMessage),
    signMessageAsync: ReactLogger.profiled(
      "signMessageAsync",
      signMessageAsync
    ),
    signedMessage,
    isSigningMessage,
    error,
  };
}
