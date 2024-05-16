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

      return client.signMessageWith6492(params);
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
    signMessage,
    signMessageAsync,
    signedMessage,
    isSigningMessage,
    error,
  };
}
