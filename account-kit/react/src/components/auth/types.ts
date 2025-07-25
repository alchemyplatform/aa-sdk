import type {
  KnownAuthProvider,
  OauthRedirectConfig,
} from "@account-kit/signer";
import type { WalletConnectParameters } from "wagmi/connectors";
import { capitalize } from "../../utils.js";
import type { WalletConfig } from "./wallet-buttons/useWalletButtons.js";

export interface ExternalWalletUIConfig {
  id: string; // Unique identifier (connector.type for EVM, adapter.name for Solana, "WalletConnect" for WalletConnect)
  type: "evm" | "solana" | "walletconnect"; // Type of wallet
  featured?: number; // Index for featured ordering (0, 1, 2, etc.)
  logoUrl?: string; // Custom logo URL
}

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
      walletConnect?: WalletConnectParameters;
      /**
       * Configuration for featured wallet display
       * When specified, selected wallets will be shown directly in the auth section
       * instead of requiring a separate "pick wallet" screen
       */
      featuredWallets?: {
        /**
         * Specific wallets to show as featured. Can be:
         * - Wallet adapter instances (for Solana)
         * - Connector instances (for EVM)
         * - String identifiers: "WalletConnect", "MetaMask", etc.
         *
         * @example
         * ```ts
         * const phantomAdapter = new PhantomWalletAdapter();
         * const metamaskConnector = injected();
         *
         * featuredWallets: {
         *   wallets: [
         *     phantomAdapter,           // Direct Solana adapter
         *     metamaskConnector,        // Direct EVM connector
         *     "WalletConnect",          // String identifier
         *   ]
         * }
         * ```
         */
        wallets?: WalletConfig[];
        /**
         * Custom text for the "more wallets" button
         *
         * @default "More wallets"
         */
        moreButtonText?: string;
      };
      /**
       * Simplified wallet configuration using ExternalWalletUIConfig objects
       * Contains id, type, featured index, and logoUrl for each wallet
       */
      wallets?: ExternalWalletUIConfig[];
      /**
       * Custom text for the "more wallets" button when using wallets array
       *
       * @default "More wallets"
       */
      moreButtonText?: string;
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
