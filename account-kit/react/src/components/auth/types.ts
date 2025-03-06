import type {
  KnownAuthProvider,
  OauthRedirectConfig,
} from "@account-kit/signer";
import type { WalletConnectParameters } from "wagmi/connectors";
import { capitalize } from "../../utils.js";

export type AuthType =
  | {
      // TODO: this should support setting redirectParams which will be added to the email redirect
      type: "email";
      emailMode?: "magicLink" | "otp";
      hideButton?: boolean;
      buttonLabel?: string;
      placeholder?: string;
    }
  | { type: "passkey" }
  | { type: "external_wallets"; walletConnect?: WalletConnectParameters }
  | ({ type: "social"; scope?: string; claims?: string } & (
      | {
          authProviderId: "auth0";
          isCustomProvider?: false;
          auth0Connection?: string;
          displayName: string;
          logoUrl: string;
          logoUrlDark?: string;
        }
      | {
          authProviderId: KnownAuthProvider;
          isCustomProvider?: false;
          auth0Connection?: never;
          displayName?: never;
          logoUrl?: never;
          logoUrlDark?: never;
        }
    ) &
      OauthRedirectConfig);

export function getSocialProviderDisplayName(
  authType: Extract<AuthType, { type: "social" }>,
): string {
  return authType.displayName ?? capitalize(authType.authProviderId);
}
