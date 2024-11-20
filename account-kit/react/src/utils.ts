import type { WalletConnectParameters } from "wagmi/connectors";

export function capitalize(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function assertNever(msg: string) {
  throw new Error(msg);
}

export function getWalletConnectParams(
  walletConnectAuthConfig: WalletConnectParameters | undefined
): WalletConnectParameters | undefined {
  if (!walletConnectAuthConfig) return undefined;

  return walletConnectAuthConfig
    ? ({
        ...walletConnectAuthConfig,
        qrModalOptions: {
          ...walletConnectAuthConfig.qrModalOptions,
          themeVariables: {
            "--wcm-z-index": "1000000",
            ...walletConnectAuthConfig.qrModalOptions?.themeVariables,
          },
        },
      } as WalletConnectParameters)
    : undefined;
}
