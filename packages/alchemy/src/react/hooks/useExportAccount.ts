"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { createElement, useCallback } from "react";
import type { ExportWalletParams as ExportAccountParams } from "../../index.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseExportAccountData = boolean;

export type UseExportAccountParams = void;

export type UseExportAccountMutationArgs = BaseHookMutationArgs<
  UseExportAccountData,
  UseExportAccountParams
>;

export type ExportAccountComponentProps = {
  iframeCss?: string;
  className?: string;
  isExported: boolean;
};

export type UseExportAccountResult = {
  exportAccount: UseMutateFunction<
    UseExportAccountData,
    Error,
    UseExportAccountParams,
    unknown
  >;
  isExported: boolean;
  isExporting: boolean;
  error: Error | null;
  ExportAccountComponent: (props: ExportAccountComponentProps) => JSX.Element;
};

export function useExportAccount(
  params: ExportAccountParams,
  mutationArgs?: UseExportAccountMutationArgs
): UseExportAccountResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();

  const {
    mutate: exportAccount,
    isPending,
    error,
    data,
  } = useMutation(
    {
      mutationFn: async () => signer!.exportWallet(params),
      ...mutationArgs,
    },
    queryClient
  );

  const ExportAccountComponent = useCallback(
    ({ iframeCss, className, isExported }: ExportAccountComponentProps) => {
      return createElement(
        "div",
        {
          className,
          style: { display: !isExported ? "none" : "block" },
          id: params.iframeContainerId,
        },
        createElement("style", {}, iframeCss)
      );
    },
    [params.iframeContainerId]
  );

  return {
    isExported: !!data,
    exportAccount,
    isExporting: isPending,
    error,
    ExportAccountComponent,
  };
}
