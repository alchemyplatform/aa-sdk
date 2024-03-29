"use client";

import { useMutation } from "@tanstack/react-query";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import type { AuthParams } from "../../signer/signer.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

export function useAuthenticate() {
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

        const user = await signer.authenticate(authParams);

        return user;
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
