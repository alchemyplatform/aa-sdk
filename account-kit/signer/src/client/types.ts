import type { Address } from "@aa-sdk/core";
import type { TSignedRequest, getWebAuthnAttestation } from "@turnkey/http";
import type { Hex } from "viem";
import type { AuthParams } from "../signer";

export type CredentialCreationOptionOverrides = {
  publicKey?: Partial<CredentialCreationOptions["publicKey"]>;
} & Pick<CredentialCreationOptions, "signal">;

// [!region User]
export type User = {
  email?: string;
  orgId: string;
  userId: string;
  address: Address;
  solanaAddress?: string;
  credentialId?: string;
  idToken?: string;
  claims?: Record<string, unknown>;
};
// [!endregion User]

export type ExportWalletParams = {
  iframeContainerId: string;
  iframeElementId?: string;
};

export type CreateAccountParams =
  | {
      type: "email";
      email: string;
      /** @deprecated This option will be overriden by dashboard settings. Please use the dashboard settings instead. This option will be removed in a future release. */
      emailMode?: EmailType;
      expirationSeconds?: number;
      redirectParams?: URLSearchParams;
    }
  | {
      type: "passkey";
      email: string;
      creationOpts?: CredentialCreationOptionOverrides;
    }
  | {
      type: "passkey";
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    };

export type EmailType = "magicLink" | "otp";

export type EmailAuthParams = {
  email: string;
  /** @deprecated This option will be overriden by dashboard settings. Please use the dashboard settings instead. This option will be removed in a future release. */
  emailMode?: EmailType;
  expirationSeconds?: number;
  targetPublicKey: string;
  redirectParams?: URLSearchParams;
};

export type OauthParams = Extract<AuthParams, { type: "oauth" }> & {
  expirationSeconds?: number;
};

export type OtpParams = {
  orgId: string;
  otpId: string;
  otpCode: string;
  targetPublicKey: string;
  expirationSeconds?: number;
};

export type JwtParams = {
  jwt: string;
  targetPublicKey: string;
  authProvider: string;
  expirationSeconds?: number;
};

export type JwtResponse = {
  isSignUp: boolean;
  orgId: string;
  credentialBundle: string;
};

export type SignupResponse = {
  orgId: string;
  userId?: string;
  address?: Address;
  otpId?: string;
};

export type OauthConfig = {
  codeChallenge: string;
  requestKey: string;
  authProviders: AuthProviderConfig[];
};

export type EmailConfig = {
  mode?: "MAGIC_LINK" | "OTP";
};

export type SignerConfig = {
  email: EmailConfig;
};

export type AuthProviderConfig = {
  id: string;
  isCustomProvider?: boolean;
  clientId: string;
  authEndpoint: string;
};

export type SignerRoutes = SignerEndpoints[number]["Route"];
export type SignerBody<T extends SignerRoutes> = Extract<
  SignerEndpoints[number],
  { Route: T }
>["Body"];
export type SignerResponse<T extends SignerRoutes> = Extract<
  SignerEndpoints[number],
  { Route: T }
>["Response"];

export type SignerEndpoints = [
  {
    Route: "/v1/signup";
    Body:
      | (Omit<EmailAuthParams, "redirectParams"> & {
          redirectParams?: string;
        })
      | {
          passkey: {
            challenge: string;
            attestation: Awaited<ReturnType<typeof getWebAuthnAttestation>>;
          };
        };
    Response: SignupResponse;
  },
  {
    Route: "/v1/whoami";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: User;
  },
  {
    Route: "/v1/auth";
    Body: Omit<EmailAuthParams, "redirectParams"> & {
      redirectParams?: string;
    };
    Response: {
      orgId: string;
      otpId?: string;
    };
  },
  {
    Route: "/v1/lookup";
    Body: {
      email: string;
    };
    Response: {
      orgId: string | null;
    };
  },
  {
    Route: "/v1/sign-payload";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      signature: Hex;
    };
  },
  {
    Route: "/v1/prepare-oauth";
    Body: {
      nonce: string;
    };
    Response: OauthConfig;
  },
  {
    Route: "/v1/otp";
    Body: OtpParams;
    Response: { credentialBundle: string };
  },
  {
    Route: "/v1/auth-jwt";
    Body: JwtParams;
    Response: JwtResponse;
  },
  {
    Route: "/v1/signer-config";
    Body: {};
    Response: SignerConfig;
  }
];

export type AuthenticatingEventMetadata = {
  type: "email" | "passkey" | "oauth" | "otp" | "otpVerify" | "custom-jwt";
};

export type AlchemySignerClientEvents = {
  connected(user: User): void;
  newUserSignup(): void;
  authenticating(data: AuthenticatingEventMetadata): void;
  connectedEmail(user: User, bundle: string): void;
  connectedPasskey(user: User): void;
  connectedOauth(user: User, bundle: string): void;
  connectedOtp(user: User, bundle: string): void;
  connectedJwt(user: User, bundle: string): void;
  disconnected(): void;
};

export type AlchemySignerClientEvent = keyof AlchemySignerClientEvents;

export type GetWebAuthnAttestationResult = {
  attestation: Awaited<ReturnType<typeof getWebAuthnAttestation>>;
  challenge: ArrayBuffer;
  authenticatorUserId: ArrayBuffer;
};

export type OauthState = {
  authProviderId: string;
  isCustomProvider?: boolean;
  requestKey: string;
  turnkeyPublicKey: string;
  expirationSeconds?: number;
  redirectUrl?: string;
  openerOrigin?: string;
};

export type GetOauthProviderUrlArgs = {
  oauthParams: OauthParams;
  turnkeyPublicKey: string;
  oauthCallbackUrl: string;
  oauthConfig?: OauthConfig;
  usesRelativeUrl?: boolean;
};
