"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import type { Hex, TypedDataDefinition } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedError } from "../errors.js";
import type { BaseHookMutationArgs } from "../types.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";

export type SignTypedDataArgs = { typedData: TypedDataDefinition };

export type UseSignTypedDataMutationArgs = BaseHookMutationArgs<
  Hex,
  SignTypedDataArgs
>;

export type UseSignTypedDataArgs = {
  client: UseSmartAccountClientResult["client"] | undefined;
} & UseSignTypedDataMutationArgs;

export type UseSignTypedDataResult = {
  signTypedData: UseMutateFunction<Hex, Error, SignTypedDataArgs, unknown>;
  signTypedDataAsync: UseMutateAsyncFunction<
    Hex,
    Error,
    SignTypedDataArgs,
    unknown
  >;
  signedTypedData: Hex | undefined;
  isSigningTypedData: boolean;
  error: Error | null;
};

export function useSignTypedData({
  client,
  ...mutationArgs
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
      ...mutationArgs,
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
