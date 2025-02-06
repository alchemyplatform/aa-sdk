"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { signTypedData as wagmi_signTypedData } from "@wagmi/core";
import type { Hex, TypedDataDefinition } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import { ClientUndefinedHookError } from "../errors.js";
import { ReactLogger } from "../metrics.js";
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

/**
 * Similar to `useSignMessage`, [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignTypedData.ts) for signing typed data, supporting both connected accounts and clients in EIP 712 format.
 *
 * Uses `eth_signTypedData` to sign structured, typed data. Accepts typed, complex data structures as input. Like `useSignMessage`, this hook also handles deployed (1271) and undeployed accounts (6492).
 *
 * @param {UseSignTypedDataArgs} args The arguments for the hook, including client and mutation-related arguments. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignTypedData.ts#L24)
 * @returns {UseSignTypedDataResult} An object containing methods and state related to the sign typed data mutation process. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignTypedData.ts#L28)
 *
 * @example
 * ```ts twoslash
 * import { useSignTypedData, useSmartAccountClient } from "@account-kit/react";
 *
 * const typedData = {
 *     types: {
 *       Message: [{ name: "content", type: "string" }],
 *     },
 *     primaryType: "Message",
 *     message: { content: "Hello" },
 *   }
 * const { client } = useSmartAccountClient({ type: "LightAccount" });
 * const { signTypedData, signTypedDataAsync, signedTypedData, isSigningTypedData, error } = useSignTypedData({
 *  client,
 *  // these are optional
 *  onSuccess: (result) => {
 *    // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 *
 * const result = await signTypedData({ typedData });
 * ```
 */
export function useSignTypedData({
  client,
  ...mutationArgs
}: UseSignTypedDataArgs): UseSignTypedDataResult {
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: signTypedData,
    mutateAsync: signTypedDataAsync,
    data: signedTypedData,
    isPending: isSigningTypedData,
    error,
  } = useMutation(
    {
      mutationFn: async (params: SignTypedDataArgs) => {
        if (isConnected) {
          return wagmi_signTypedData(wagmiConfig, params.typedData);
        }

        if (!client) {
          throw new ClientUndefinedHookError("useSignTypedData");
        }
        return client.signTypedData({ ...params });
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    signTypedData: ReactLogger.profiled("signTypedData", signTypedData),
    signTypedDataAsync: ReactLogger.profiled(
      "signTypedDataAsync",
      signTypedDataAsync
    ),
    signedTypedData,
    isSigningTypedData,
    error,
  };
}
