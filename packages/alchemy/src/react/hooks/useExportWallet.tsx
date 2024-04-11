"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import React from "react";
import { ClientOnlyPropertyError } from "../../config/errors.js";
import type { ExportWalletParams } from "../../index.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSigner } from "./useSigner.js";

export interface ExportWalletComponentProps {
  className: string;
  iframeCss: string;
}

export type UseExportWalletResult = {
  exportWallet: UseMutateFunction<boolean, Error, void, unknown>;
  isExported: boolean;
  isExporting: boolean;
  error: Error | null;
  ExportWalletComponent: (
    props: ExportWalletComponentProps
  ) => React.JSX.Element;
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

  const isExported = !!data;

  const ExportWalletComponent = ({
    className,
    iframeCss,
  }: ExportWalletComponentProps) => {
    return (
      <div
        className={className}
        style={{ display: !isExported ? "none" : "block" }}
        id={params.iframeContainerId}
      >
        <style>{iframeCss}</style>
      </div>
    );
  };

  return {
    isExported,
    exportWallet,
    isExporting: isPending,
    error,
    ExportWalletComponent,
  };
}
