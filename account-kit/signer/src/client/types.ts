import type { Address } from "@aa-sdk/core";
import type {
  TSignedRequest,
  TurnkeyApiTypes,
  getWebAuthnAttestation,
} from "@turnkey/http";
import type { Hex } from "viem";
import type { AuthParams } from "../signer";

// [!region VerificationOtp]
export type VerificationOtp = {
  /** The OTP ID returned from initOtp */
  id: string;
  /** The OTP code received by the user */
  code: string;
};
// [!endregion VerificationOtp]

export type CredentialCreationOptionOverrides = {
  publicKey?: Partial<CredentialCreationOptions["publicKey"]>;
} & Pick<CredentialCreationOptions, "signal">;

// [!region User]
export type User = {
  email?: string;
  phone?: string;
  orgId: string;
  userId: string;
  address: Address;
  solanaAddress?: string;
  credentialId?: string;
  idToken?: string;
  accessToken?: string;
  claims?: Record<string, unknown>;
};
// [!endregion User]

export type ExportWalletParams = {
  iframeContainerId: string;
  iframeElementId?: string;
};

export type ExportWalletOutput = boolean;

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
      type: "sms";
      phone: string;
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

export type SmsAuthParams = {
  phone: string;
  targetPublicKey: string;
};

export type OauthParams = Extract<AuthParams, { type: "oauth" }> & {
  expirationSeconds?: number;
  fetchIdTokenOnly?: boolean;
};

export type OtpParams = {
  orgId: string;
  otpId: string;
  otpCode: string;
  targetPublicKey: string;
  expirationSeconds?: number;
  multiFactors?: VerifyMfaParams[];
};

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

export type JwtParams = {
  jwt: string;
  targetPublicKey: string;
  authProvider?: string;
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
  solanaAddress?: string;
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
      | SmsAuthParams
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
    Body:
      | (Omit<EmailAuthParams, "redirectParams"> & {
          redirectParams?: string;
          multiFactors?: VerifyMfaParams[];
        })
      | SmsAuthParams;
    Response: {
      orgId: string;
      otpId?: string;
      multiFactors?: MfaFactor[];
    };
  },
  {
    Route: "/v1/lookup";
    Body: {
      email?: string;
      phone?: string;
    };
    Response: {
      orgId: string | null;
    };
  },
  {
    Route: "/v1/init-otp";
    Body: {
      contact: string;
      otpType: "OTP_TYPE_SMS" | "OTP_TYPE_EMAIL";
    };
    Response: {
      otpId: string;
    };
  },
  {
    Route: "/v1/verify-otp";
    Body: {
      otpId: string;
      otpCode: string;
    };
    Response: {
      verificationToken: string;
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
    Route: "/v1/update-email-auth";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: void;
  },
  {
    Route: "/v1/update-phone-auth";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: void;
  },
  {
    Route: "/v1/add-oauth-provider";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: { oauthProviders: OauthProviderInfo[] };
  },
  {
    Route: "/v1/remove-oauth-provider";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: void;
  },
  {
    Route: "/v1/list-auth-methods";
    Body: {};
    Response: AuthMethods;
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
    Response: AddMfaResult;
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
    Route: "/v1/auth-jwt";
    Body: JwtParams;
    Response: JwtResponse;
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
  },
  {
    Route: "/v1/multi-owner-create";
    Body: {
      members: {
        evmSignerAddress: Address;
      }[];
    };
    Response: {
      result: {
        orgId: string;
        evmSignerAddress: Address;
        members: {
          evmSignerAddress: Address;
        }[];
      };
    };
  },
  {
    Route: "/v1/multi-owner-prepare-add";
    Body: {
      organizationId: string;
      members: {
        evmSignerAddress: Address;
      }[];
    };
    Response: {
      result: TurnkeyApiTypes["v1CreateUsersRequest"];
    };
  },
  {
    Route: "/v1/multi-owner-add";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      result: {
        members: {
          evmSignerAddress: Address;
        }[];
        updateRootQuorumRequest: TurnkeyApiTypes["v1UpdateRootQuorumRequest"];
      };
    };
  },
  {
    Route: "/v1/multi-owner-update-root-quorum";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      result: TurnkeyApiTypes["v1UpdateRootQuorumResult"];
    };
  },
  {
    Route: "/v1/multi-owner-sign-raw-payload";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      result: {
        signRawPayloadResult: TurnkeyApiTypes["v1SignRawPayloadResult"];
      };
    };
  },
  {
    Route: "/v1/multi-owner-prepare-delete";
    Body: {
      organizationId: string;
      members: {
        evmSignerAddress: Address;
      }[];
    };
    Response: {
      result: {
        updateRootQuorumRequest: TurnkeyApiTypes["v1UpdateRootQuorumRequest"];
        deleteMembersRequest: TurnkeyApiTypes["v1DeleteUsersRequest"];
      };
    };
  },
  {
    Route: "/v1/multi-owner-delete";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      result: {
        deletedUserIds: string[];
      };
    };
  },
];

export type AuthenticatingEventMetadata = {
  type:
    | "email"
    | "passkey"
    | "oauth"
    | "otp"
    | "otpVerify"
    | "custom-jwt"
    | "sms";
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
  challenge: ArrayBuffer | string;
  authenticatorUserId: BufferSource;
};

export type AuthLinkingPrompt = {
  status: "ACCOUNT_LINKING_CONFIRMATION_REQUIRED";
  idToken: string;
  accessToken?: string;
  email: string;
  providerName: string;
  otpId: string;
  orgId: string;
};

export type IdTokenOnly = {
  status: "FETCHED_ID_TOKEN_ONLY";
  idToken: string;
  accessToken?: string;
  providerName: string;
};

export type OauthState = {
  authProviderId: string;
  isCustomProvider?: boolean;
  requestKey: string;
  turnkeyPublicKey: string;
  expirationSeconds?: number;
  redirectUrl?: string;
  openerOrigin?: string;
  fetchIdTokenOnly?: boolean;
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

export type AddMfaParams = {
  multiFactorType: MultiFactorType;
};

export type AddMfaResult = {
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
  encryptedPayload: string;
  multiFactors: VerifyMfaParams[];
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

export type AddOauthProviderParams = {
  providerName: string;
  oidcToken: string;
};

export type AuthMethods = {
  email?: string;
  phone?: string;
  oauthProviders: OauthProviderInfo[];
  passkeys: PasskeyInfo[];
};

export type OauthProviderInfo = {
  providerId: string;
  issuer: string;
  providerName?: string;
  userDisplayName?: string;
};

export type PasskeyInfo = {
  authenticatorId: string;
  name: string;
  createdAt: number;
};

export type experimental_CreateApiKeyParams = {
  name: string;
  publicKey: string;
  expirationSec: number;
};
