import type {
  KnownAuthProvider,
  OauthRedirectConfig,
} from "@account-kit/signer";
import { capitalize } from "../../utils.js";
import type {
  ChainType,
  // ExternalWalletUIConfig,
} from "../../configForExternalWallets.js";

export type AuthType =
  | {
      // TODO: this should support setting redirectParams which will be added to the email redirect
      type: "email";
      /** @deprecated This option will be overriden by dashboard settings. Please use the dashboard settings instead. This option will be removed in a future release. */
      emailMode?: "magicLink" | "otp";
      hideButton?: boolean;
      buttonLabel?: string;
      placeholder?: string;
    }
  | { type: "passkey" }
  | {
      type: "external_wallets";
      // New simplified shape
      wallets?: string[];
      chainType?: ChainType[];
      // Optional: fallback WC config for UI-only flows
      walletConnectProjectId?: string;
      // How many from wallets to feature on landing
      numFeaturedWallet?: number;
      // Backwards compatible shape
      walletConnect?: import("wagmi/connectors").WalletConnectParameters;
      moreButtonText?: string;
      hideMoreButton?: boolean;
    }
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
