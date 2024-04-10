"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import type { User } from "../../signer/index.js";
import type { AuthParams } from "../../signer/signer.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

export type UseAuthenticateResult = {
  authenticate: UseMutateFunction<User, Error, AuthParams, unknown>;
  isPending: boolean;
  error: Error | null;
};

export function useAuthenticate(): UseAuthenticateResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: authenticate,
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
    },
    queryClient
  );

  return {
    authenticate,
    isPending,
    error,
  };
}
