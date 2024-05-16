"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { Hex, SignableMessage } from "viem";
import {
  useAccount as wagmi_useAccount,
  useSignMessage as wagmi_useSignMessage,
} from "wagmi";
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
  const { queryClient } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount();
  const { signMessageAsync: wagmi_signMessageAsync } = wagmi_useSignMessage();

  const {
    mutate: signMessage,
    mutateAsync: signMessageAsync,
    data: signedMessage,
    isPending: isSigningMessage,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignMessageArgs) => {
        if (isConnected) {
          return wagmi_signMessageAsync(params);
        }

        if (!client) {
          throw new ClientUndefinedHookError("useSignMessage");
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
