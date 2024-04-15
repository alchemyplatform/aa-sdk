"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { createElement, useCallback } from "react";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../../config/createConfig.js";
import type { ExportWalletParams as ExportAccountParams } from "../../index.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseExportAccountData = boolean;

export type UseExportAccountParams = void;

export type UseExportAccountMutationArgs = {
  params?: ExportAccountParams;
} & BaseHookMutationArgs<UseExportAccountData, UseExportAccountParams>;

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
  args?: UseExportAccountMutationArgs
): UseExportAccountResult {
  const { params, ...mutationArgs } = args ?? {};
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const { iframeContainerId } = params ?? {
    iframeContainerId: DEFAULT_IFRAME_CONTAINER_ID,
  };

  const {
    mutate: exportAccount,
    isPending,
    error,
    data,
  } = useMutation(
    {
      mutationFn: async () =>
        signer!.exportWallet(params ?? { iframeContainerId }),
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
          id: iframeContainerId,
        },
        createElement("style", {}, iframeCss)
      );
    },
    [iframeContainerId]
  );

  return {
    isExported: !!data,
    exportAccount,
    isExporting: isPending,
    error,
    ExportAccountComponent,
  };
}
