"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { TypedDataDefinition } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import type { UseSignMessageData } from "./useSignMessage.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type UseSignTypedDataData = UseSignMessageData;

export type SignTypedDataArgs = { typedData: TypedDataDefinition };

export type UseSignTypedDataMutationArgs = BaseHookMutationArgs<
  UseSignMessageData,
  SignTypedDataArgs
>;

export type UseSignTypedDataArgs = {
  client?: UseSmartAccountClientResult["client"];
} & UseSignTypedDataMutationArgs;

export type UseSignTypedDataResult = {
  signTypedData: UseMutateFunction<
    UseSignTypedDataData,
    Error,
    SignTypedDataArgs,
    unknown
  >;
  signTypedDataAsync: UseMutateAsyncFunction<
    UseSignTypedDataData,
    Error,
    SignTypedDataArgs,
    unknown
  >;
  signedTypedData: UseSignTypedDataData | undefined;
  isSigningTypedData: boolean;
  error: Error | null;
};

export function useSignTypedData({
  client,
}: UseSignTypedDataArgs): UseSignTypedDataResult {
  const { queryClient } = useAlchemyAccountContext();

  const {
    mutate: signTypedData,
    mutateAsync: signTypedDataAsync,
    data: signedTypedData,
    isPending: isSigningTypedData,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignTypedDataArgs) => {
        if (!client) {
          throw new ClientUndefinedError("useSignTypedData");
        }
        return client.signTypedDataWith6492({ ...params });
      },
    },
    queryClient
  );

  return {
    signTypedData,
    signTypedDataAsync,
    signedTypedData,
    isSigningTypedData,
    error,
  };
}
