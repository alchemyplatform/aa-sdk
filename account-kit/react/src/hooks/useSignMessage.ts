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
 * Custom [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignMessage.ts) to sign a message using the provided client.
 * Provides a way to sign messages within the context of an account using Ethereum-specific signature in EIP-191 format. Uses `personal_sign` to sign arbitrary messages (usually strings). Accepts any plain message as input.
 *
 * Until the method completes, `isSigningMessage` is true and `signedMessage` is null until eventually returning either a 1271 or 6492 signature (if the smart contract account has not been deployed yet), which is useful if you need to render the signature to the UI. `signedMessageAsync` is useful over `signedMessage` if you need to chain calls together.
 *
 * Using 1271 validation, the mechanisms by which you can validate the smart contract account, we verify the message was signed by the smart contract itself rather than the EOA signer.
 *
 * To reiterate, the signature that is returned must be verified against the account itself not the signer. The final structure of the signature is dictated by how the account does 1271 validation. You don’t want to be verifying in a different way than the way the account itself structures the signatures to be validated. For example LightAccount has three different ways to validate the account.
 *
 * @param {UseSignMessageArgs} config The configuration arguments for the hook, including the client and additional mutation arguments. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignMessage.ts#L25)
 * @returns {UseSignMessageResult} An object containing methods and state for signing messages. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignMessage.ts#L29)
 *
 * @example
 * ```ts twoslash
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
