"use client";

import { DEFAULT_IFRAME_CONTAINER_ID } from "@account-kit/core";
import type { ExportWalletParams as ExportAccountParams } from "@account-kit/signer";
import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { createElement, useCallback, type CSSProperties } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
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

/**
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useExportAccount.ts) used to export the private key for an account. It returns the mutation functions to kick off the export process, as well as a component to render the account recovery details in an iframe.
 * What is returned is dependent on what you used most recently used to authenticate. If your session was initiated with a passkey, then a private key is returned. Otherwise, a seed phrase.
 *
 * @param {UseExportAccountMutationArgs} args Optional arguments for the mutation and export parameters. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useExportAccount.ts#L11)
 * @returns {UseExportAccountResult} An object containing the export state, possible error, and the export account function and component. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useExportAccount.ts#L32)*
 *
 * @example
 * ```ts twoslash
 * import { useExportAccount } from "@account-kit/react";
 *
 * const {
 *  exportAccount,
 *  isExported,
 *  isExporting,
 *  error,
 *  ExportAccountComponent
 * } = useExportAccount({
 *  params: {
 *    iframeContainerId: "my-iframe-container",
 *  },
 * });
 * ```
 */
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
