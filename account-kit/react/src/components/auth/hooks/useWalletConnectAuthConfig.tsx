"use client";

import type { WalletConnectParameters } from "wagmi/connectors";
import { useAuthConfig } from "../../../hooks/internal/useAuthConfig.js";
import { getWalletConnectParams } from "../../../utils.js";
import type { AuthType } from "../types.js";

export const useWalletConnectAuthConfig = (): {
  walletConnectParams: WalletConnectParameters | undefined;
  walletConnectAuthConfig:
    | Extract<AuthType, { type: "external_wallets" }>["walletConnect"]
    | undefined;
} => {
  const walletConnectAuthConfig = useAuthConfig((auth) => {
    const externalWalletSection = auth.sections
      .find((x) => x.some((y) => y.type === "external_wallets"))
      ?.find((x) => x.type === "external_wallets") as
      | Extract<AuthType, { type: "external_wallets" }>
      | undefined;

    return externalWalletSection?.walletConnect;
  });

  // Add z-index to the wallet connect modal if not already set
  const walletConnectParams = getWalletConnectParams(walletConnectAuthConfig);

  return {
    walletConnectParams,
    walletConnectAuthConfig,
  };
};
