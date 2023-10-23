import { type OAuthRedirectResult } from "@magic-ext/react-native-bare-oauth";
import { type MagicUserMetadata } from "@magic-sdk/react-native-bare";

export type MagicAuth = {
  address: string | null;
  isLoggedIn: boolean | null;
  metaData: MagicUserMetadata | null;

  did?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  oAuthRedirectResult?: OAuthRedirectResult | null;
};

export type MagicAuthType = "google" | "apple" | "magic" | "email" | "sms";
