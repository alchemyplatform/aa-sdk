"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { Hex, SignableMessage } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
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
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: signMessage,
    mutateAsync: signMessageAsync,
    data: signedMessage,
    isPending: isSigningMessage,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignMessageArgs) => {
        if (!client) {
          throw new ClientUndefinedError("useSignMessage");
        }

        return client.signMessageWith6492(params);
      },
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
