import { AuthType } from "@account-kit/react";
import { KnownAuthProvider } from "@account-kit/signer";
import { Config } from "./config";

export function getSectionsForConfig(
  config: Config,
  walletConnectProjectId: string
): AuthType[][] {
  const { showPasskey, showOAuth, oAuthMethods, showExternalWallets } =
    config.auth;
  const sections: AuthType[][] = [[{ type: "email" }]];
  const midSection: AuthType[] = [];
  if (showPasskey) {
    midSection.push({ type: "passkey" });
  }
  if (showOAuth) {
    for (const [method, enabled] of Object.entries(oAuthMethods)) {
      if (enabled) {
        midSection.push({
          type: "social",
          authProviderId: method as KnownAuthProvider, // TODO: extend for BYO auth provider
          mode: "redirect",
          redirectUrl: "http://localhost:3000",
        });
      }
    }
  }
  if (midSection.length > 0) {
    sections.push(midSection);
  }
  if (showExternalWallets) {
    sections.push([
      {
        type: "external_wallets",
        walletConnect: { projectId: walletConnectProjectId },
      },
    ]);
  }
  return sections;
}
