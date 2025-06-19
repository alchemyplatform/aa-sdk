import type { User } from "./client/types";

export type AlchemySignerEvents = {
  connected(user: User): void;
  newUserSignup(): void;
  disconnected(): void;
  statusChanged(status: AlchemySignerStatus): void;
  errorChanged(error: ErrorInfo | undefined): void;
  mfaStatusChanged(mfaStatus: {
    mfaRequired: boolean;
    mfaFactorId?: string;
    encryptedPayload?: string;
  }): void;
  emailAuthLinkingRequired(email: string): void;
};

export type AlchemySignerEvent = keyof AlchemySignerEvents;

export enum AlchemySignerStatus {
  INITIALIZING = "INITIALIZING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  AUTHENTICATING_PASSKEY = "AUTHENTICATING_PASSKEY",
  AUTHENTICATING_EMAIL = "AUTHENTICATING_EMAIL",
  AUTHENTICATING_OAUTH = "AUTHENTICATING_OAUTH",
  AUTHENTICATING_JWT = "AUTHENTICATING_JWT",
  AWAITING_EMAIL_AUTH = "AWAITING_EMAIL_AUTH",
  AWAITING_SMS_AUTH = "AWAITING_SMS_AUTH",
  AWAITING_OTP_AUTH = "AWAITING_OTP_AUTH",
  AWAITING_MFA_AUTH = "AWAITING_MFA_AUTH",
}

export enum AlchemyMfaStatus {
  NOT_REQUIRED = "not_required",
  REQUIRED = "required",
}

export interface ErrorInfo {
  name: string;
  message: string;
}

export type ValidateMultiFactorsArgs = {
  multiFactorId?: string;
  multiFactorCode: string;
};
