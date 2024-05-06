"use client";

import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import type { User } from "../../signer/index.js";
import type { AuthParams } from "../../signer/signer.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseAuthenticateMutationArgs = BaseHookMutationArgs<
  User,
  AuthParams
>;

export type UseAuthenticateResult = {
  authenticate: UseMutateFunction<User, Error, AuthParams, unknown>;
  authenticateAsync: UseMutateAsyncFunction<User, Error, AuthParams, unknown>;
  isPending: boolean;
  error: Error | null;
};

export function useAuthenticate(
  mutationArgs?: UseAuthenticateMutationArgs
): UseAuthenticateResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const {
    mutate: authenticate,
    mutateAsync: authenticateAsync,
    isPending,
    error,
  } = useMutation(
    {
      mutationFn: async (authParams: AuthParams) => {
        if (!signer) {
          throw new ClientOnlyPropertyError("signer");
        }

        return signer.authenticate(authParams);
      },
      ...mutationArgs,
    },
    queryClient
  );

  return {
    authenticate,
    authenticateAsync: authenticateAsync,
    isPending,
    error,
  };
}
