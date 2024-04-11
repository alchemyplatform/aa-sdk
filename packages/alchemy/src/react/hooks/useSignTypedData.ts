"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import type { TypedDataDefinition } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { useBundlerClient } from "./useBundlerClient.js";
import type {
  SignedMessageInfo,
  UseSignMessageArgs,
} from "./useSignMessage.js";

export type SignedTypedDataInfo = SignedMessageInfo;

export type SignTypedDataArgs = { typedData: TypedDataDefinition };

export type UseSignTypedDataArgs = UseSignMessageArgs;

export type UseSignTypedDataResult = {
  signTypedData: UseMutateFunction<
    SignedTypedDataInfo,
    Error,
    SignTypedDataArgs,
    unknown
  >;
  signedTypedDataInfo: SignedTypedDataInfo | undefined;
  isSigningTypedData: boolean;
  error: Error | null;
};

export function useSignTypedData({
  client,
}: UseSignTypedDataArgs): UseSignTypedDataResult {
  const { queryClient } = useAlchemyAccountContext();
  const bundlerClient = useBundlerClient();

  const {
    mutate: signTypedData,
    data: signedTypedDataInfo,
    isPending: isSigningTypedData,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignTypedDataArgs) => {
        if (!client) {
          throw new Error("client must be defined");
        }
        const signature = await client.signTypedDataWith6492({ ...params });
        const isValid = await bundlerClient.verifyTypedData({
          address: client.getAddress(),
          signature,
          ...params.typedData,
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
    signTypedData,
    signedTypedDataInfo,
    isSigningTypedData,
    error,
  };
}
