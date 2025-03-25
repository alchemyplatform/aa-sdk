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
  multiFactors?: VerifyMfaParams[];
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
  multiFactors?: VerifyMfaParams[];
};

// todo fix this type
export type OtpResponse =
  | {
      status: "SUCCESS";
      credentialBundle: string;
    }
  | {
      status: "MFA_REQUIRED";
      encryptedPayload: string;
      multiFactors: MfaFactor[];
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
      multiFactors?: VerifyMfaParams[];
    };
    Response: {
      orgId: string;
      otpId?: string;
      multiFactors?: MfaFactor[];
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
    Response: OtpResponse;
  },
  {
    Route: "/v1/auth-list-multi-factors";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      multiFactors: MfaFactor[];
    };
  },
  {
    Route: "/v1/auth-delete-multi-factors";
    Body: {
      stampedRequest: TSignedRequest;
      multiFactorIds: string[];
    };
    Response: {
      multiFactors: MfaFactor[];
    };
  },
  {
    Route: "/v1/auth-request-multi-factor";
    Body: {
      stampedRequest: TSignedRequest;
      multiFactorType: MultiFactorType;
    };
    Response: EnableMfaResult;
  },
  {
    Route: "/v1/auth-verify-multi-factor";
    Body: VerifyMfaParams & {
      stampedRequest: TSignedRequest;
    };
    Response: {
      multiFactors: MfaFactor[];
    };
  },
  {
    Route: "/v1/signer-config";
    Body: {};
    Response: SignerConfig;
  },
  {
    Route: "/v1/auth-validate-multi-factors";
    Body: {
      encryptedPayload: string;
      multiFactors: VerifyMfaParams[];
    };
    Response: {
      payload: {
        credentialBundle?: string;
      };
      multiFactors: MfaFactor[];
    };
  }
];

export type AuthenticatingEventMetadata = {
  type: "email" | "passkey" | "oauth" | "otp" | "otpVerify";
};

export type AlchemySignerClientEvents = {
  connected(user: User): void;
  newUserSignup(): void;
  authenticating(data: AuthenticatingEventMetadata): void;
  connectedEmail(user: User, bundle: string): void;
  connectedPasskey(user: User): void;
  connectedOauth(user: User, bundle: string): void;
  connectedOtp(user: User, bundle: string): void;
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

export type MfaFactor = {
  multiFactorId: string;
  multiFactorType: string;
};

type MultiFactorType = "totp";

export type EnableMfaParams = {
  multiFactorType: MultiFactorType;
};

export type EnableMfaResult = {
  multiFactorType: MultiFactorType;
  multiFactorId: string;
  multiFactorTotpUrl: string;
};

export type VerifyMfaParams = {
  multiFactorId: string;
  multiFactorCode: string;
};

export type RemoveMfaParams = {
  multiFactorIds: string[];
};

export type ValidateMultiFactorsParams = {
  multiFactorId?: string;
  multiFactorCode: string;
};

export type MfaChallenge = {
  multiFactorId: string;
  multiFactorChallenge:
    | {
        code: string;
      }
    | Record<string, any>;
};

export type SubmitOtpCodeResponse =
  | { bundle: string; mfaRequired: false }
  | { mfaRequired: true; encryptedPayload: string; multiFactors: MfaFactor[] };
