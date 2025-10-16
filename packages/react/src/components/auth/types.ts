import { capitalize } from "../../utils.js";

export type OauthProvider =
  | "google"
  | "facebook"
  | "apple"
  | "discord"
  | "twitch"
  | "auth0";

export type AuthType =
  | {
      type: "email";
      hideButton?: boolean;
      buttonLabel?: string;
      placeholder?: string;
    }
  | { type: "passkey" }
  | { type: "external_wallets" }
  | {
      type: "social";
      authProviderId: OauthProvider;
      displayName?: string;
      logoUrl?: string;
      logoUrlDark?: string;
    };

export function getSocialProviderDisplayName(
  authType: Extract<AuthType, { type: "social" }>
): string {
  return authType.displayName ?? capitalize(authType.authProviderId);
}
