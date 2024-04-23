"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { createElement, useCallback, type CSSProperties } from "react";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../../config/createConfig.js";
import type { ExportWalletParams as ExportAccountParams } from "../../index.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";

export type UseExportAccountMutationArgs = {
  params?: ExportAccountParams;
} & BaseHookMutationArgs<boolean, void>;

/**
 * Props for the `ExportAccountComponent` component. This component is
 * returned from the `useExportAccount` hook and should be rendered in the
 * parent component to display the account recovery details in an iframe.
 *
 * iframeCss [optional] - CSS to apply to the iframe.
 *
 * className [optional] - Class name to apply to the container div.
 *
 * isExported - Whether the account has been exported.
 */
export type ExportAccountComponentProps = {
  iframeCss?: CSSProperties;
  className?: string;
  isExported: boolean;
};

export type UseExportAccountResult = {
  exportAccount: UseMutateFunction<boolean, Error, void, unknown>;
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
      const iframeCssString = Object.entries(iframeCss ?? {}).reduce(
        (acc, [key, value]) => {
          const kebabKey = key
            .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
            .toLocaleLowerCase();

          return `${acc}\n${kebabKey}: ${value};`;
        },
        ""
      );

      return createElement(
        "div",
        {
          className,
          style: {
            display: !isExported ? "none" : "block",
          },
          id: iframeContainerId,
        },
        createElement("style", {}, `iframe { ${iframeCssString} } `)
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
