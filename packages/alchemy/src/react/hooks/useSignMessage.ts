"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { Hex, SignableMessage } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { useBundlerClient } from "./useBundlerClient.js";
import { type UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type SignedMessageInfo = {
  signature: Hex;
  isValid: boolean;
};

export type SignMessageArgs = { message: SignableMessage };

export type UseSignMessageArgs = {
  client?: UseSmartAccountClientResult["client"];
};

export type UseSignMessageResult = {
  signMessage: UseMutateFunction<
    SignedMessageInfo,
    Error,
    SignMessageArgs,
    unknown
  >;
  signedMessageInfo: SignedMessageInfo | undefined;
  isSigningMessage: boolean;
  error: Error | null;
};

export function useSignMessage({
  client,
}: UseSignMessageArgs): UseSignMessageResult {
  const { queryClient } = useAlchemyAccountContext();
  const bundlerClient = useBundlerClient();

  const {
    mutate: signMessage,
    data: signedMessageInfo,
    isPending: isSigningMessage,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignMessageArgs) => {
        if (!client) {
          throw new Error("client must be defined");
        }

        const signature = await client.signMessageWith6492(params);
        const isValid = await bundlerClient.verifyMessage({
          address: client.getAddress(),
          message: params.message,
          signature,
        });

        return {
          signature,
          isValid,
        };
      },
    },
    queryClient
  );

  return {
    signMessage,
    signedMessageInfo,
    isSigningMessage,
    error,
  };
}
