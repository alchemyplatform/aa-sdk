"use client";

import type { Connector } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { AuthType } from "./types";

export enum AuthStepType {
  EmailVerify = "email_verify",
  OtpVerify = "otp_verify",
  PasskeyVerify = "passkey_verify",
  PasskeyCreate = "passkey_create",
  PasskeyCreateSuccess = "passkey_create_success",
  EmailCompleting = "email_completing",
  OauthCompleting = "oauth_completing",
  Initial = "initial",
  Complete = "complete",
  EoaConnect = "eoa_connect",
  WalletConnect = "wallet_connect",
  PickEoa = "pick_eoa",
}

export enum AuthStepStatus {
  base = "base",
  success = "success",
  error = "error",
  verifying = "verifying",
}

export type AuthStep =
  | { type: AuthStepType.EmailVerify; email: string }
  | {
      type: AuthStepType.OtpVerify;
      email: string;
      error?: Error;
      status?: AuthStepStatus;
    }
  | { type: AuthStepType.PasskeyVerify; error?: Error }
  | { type: AuthStepType.PasskeyCreate; error?: Error }
  | { type: AuthStepType.PasskeyCreateSuccess }
  | { type: AuthStepType.EmailCompleting }
  | {
      type: AuthStepType.OauthCompleting;
      config: Extract<AuthType, { type: "social" }>;
      error?: Error;
    }
  | { type: AuthStepType.Initial; error?: Error }
  | { type: AuthStepType.Complete }
  | { type: AuthStepType.EoaConnect; connector: Connector; error?: Error }
  | { type: AuthStepType.WalletConnect; error?: Error }
  | { type: AuthStepType.PickEoa };

type AuthContextType<
  TType extends AuthStep["type"] | undefined = AuthStep["type"] | undefined
> = TType extends undefined
  ? {
      authStep: AuthStep;
      setAuthStep: (step: AuthStep) => void;
      resetAuthStep: () => void;
    }
  : {
      authStep: Extract<AuthStep, { type: NonNullable<TType> }>;
      setAuthStep: (step: AuthStep) => void;
      resetAuthStep: () => void;
    };

export const AuthModalContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuthContext<
  TType extends AuthStep["type"] | undefined = AuthStep["type"] | undefined
>(type?: TType): AuthContextType<TType>;

export function useAuthContext(
  type?: AuthStep["type"] | undefined
): AuthContextType {
  const context = useOptionalAuthContext();

  if (!context) {
    throw new Error(
      "useAuthModalContext must be used within a AuthModalProvider"
    );
  }

  if (type && context.authStep.type !== type) {
    throw new Error(`expected authstep to be ${type}`);
  }

  return context;
}

export const useOptionalAuthContext = (): AuthContextType | undefined =>
  useContext(AuthModalContext);
