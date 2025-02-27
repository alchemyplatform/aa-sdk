import { AuthType } from "@account-kit/react";
import { KnownAuthProvider } from "@account-kit/signer";
import { Config } from "./config";

const isTesting = process.env.NODE_ENV === "test";
const auth0TestingConnection = process.env.NEXT_PUBLIC_AUTH0_TESTING_CONNECTION;
const SocialAuth0Providers = ["twitter", "discord"];

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
    //TODO: Toggle between magic link and OTP in sidebar confg
    sections.push([{ type: "email", emailMode: "magicLink" }]);
  }
  if (showPasskey) {
    midSection.push({ type: "passkey" });
  }
  if (showOAuth) {
    for (const [method, enabled] of Object.entries(oAuthMethods)) {
      if (enabled && SocialAuth0Providers.includes(method)) {
        switch (method) {
          case "twitter":
            midSection.push({
              type: "social",
              authProviderId: "auth0",
              mode: "popup",
              auth0Connection: "twitter",
              displayName: "Twitter",
              logoUrl: "/images/twitter.svg",
              logoUrlDark: "/images/twitter-dark.svg",
              scope: "openid profile",
            });

            break;
          case "discord":
            midSection.push({
              type: "social",
              authProviderId: "auth0",
              mode: "popup",
              auth0Connection: "discord",
              displayName: "Discord",
              logoUrl: "/images/discord.svg",
              scope: "openid profile",
            });

            break;
        }
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
  if (isTesting && auth0TestingConnection) {
    midSection.push({
      type: "social",
      authProviderId: "auth0",
      mode: "popup",
      auth0Connection: auth0TestingConnection,
      displayName: "Test",
      // Re-using twitter logo for testing, will not be seen in production
      logoUrl: "/images/key.svg",
      logoUrlDark: "/images/key.svg",
      scope: "openid profile",
    });
  }
  return sections;
}
