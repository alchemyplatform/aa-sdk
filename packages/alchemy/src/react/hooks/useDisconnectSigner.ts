"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

export type UseDisconnectSignerResult = {
  disconnect: UseMutateFunction<void, Error, void, unknown>;
  isDisconnecting: boolean;
  error: Error | null;
};

export function useDisconnectSigner(): UseDisconnectSignerResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: disconnect,
    isPending: isDisconnecting,
    error,
  } = useMutation(
    {
      mutationFn: async () => {
        if (!signer) {
          throw new ClientOnlyPropertyError("signer");
        }

        return signer.disconnect();
      },
      onSuccess: () => {
        window.location.reload();
      },
    },
    queryClient
  );

  return {
    disconnect,
    isDisconnecting,
    error,
  };
}
