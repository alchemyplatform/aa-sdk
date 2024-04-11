"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import type { ExportWalletParams } from "../../index.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

export type UseExportWalletResult = {
  exportWallet: UseMutateFunction<boolean, Error, void, unknown>;
  isExported: boolean;
  isExporting: boolean;
  error: Error | null;
};

export function useExportWallet(
  params: ExportWalletParams
): UseExportWalletResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: exportWallet,
    isPending,
    error,
    data,
  } = useMutation(
    {
      mutationFn: async () => {
        if (!signer) {
          throw new ClientOnlyPropertyError("signer");
        }

        return signer.exportWallet(params);
      },
    },
    queryClient
  );

  return {
    isExported: !!data,
    exportWallet,
    isExporting: isPending,
    error,
  };
}
