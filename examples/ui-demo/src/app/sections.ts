import { AuthType } from "@account-kit/react";
import { KnownAuthProvider } from "@account-kit/signer";
import { Config } from "./config";

export function getSectionsForConfig(
  config: Config,
  walletConnectProjectId: string
): AuthType[][] {
  const {
    showEmail,
    showPasskey,
    showOAuth,
    oAuthMethods,
    showExternalWallets,
  } = config.auth;
  const sections: AuthType[][] = [];
  const midSection: AuthType[] = [];
  if (showEmail) {
    sections.push([{ type: "email", emailMode: "otp" }]);
  }
  if (showPasskey) {
    midSection.push({ type: "passkey" });
  }
  if (showOAuth) {
    for (const [method, enabled] of Object.entries(oAuthMethods)) {
      if (enabled && method === "discord") {
        midSection.push({
          type: "social",
          authProviderId: "auth0",
          mode: "popup",
          auth0Connection: "discord",
          displayName: "Discord",
          logoUrl: "/images/discord.svg",
          scope: "openid profile",
        });
      } else if (enabled) {
        midSection.push({
          type: "social",
          authProviderId: method as KnownAuthProvider, // TODO: extend for BYO auth provider
          mode: "popup",
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
