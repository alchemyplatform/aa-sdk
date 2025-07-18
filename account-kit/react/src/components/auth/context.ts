"use client";

import type { Connector } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { AuthType } from "./types";

export enum AuthStepStatus {
  base = "base",
  success = "success",
  error = "error",
  verifying = "verifying",
}

export type AuthStep =
  | { type: "email_verify"; email: string }
  | {
      type: "otp_verify";
      email: string;
      error?: Error;
      status?: AuthStepStatus;
    }
  | {
      type: "totp_verify";
      previousStep: "magicLink";
      factorId: string;
      email: string;
      error?: Error;
    }
  | {
      type: "totp_verify";
      previousStep: "otp";
      error?: Error;
    }
  | { type: "passkey_verify"; error?: Error }
  | { type: "passkey_create"; error?: Error }
  | { type: "passkey_create_success" }
  | { type: "email_completing" }
  | {
      type: "oauth_completing";
      config: Extract<AuthType, { type: "social" }>;
      error?: Error;
    }
  | { type: "initial"; error?: Error }
  | { type: "complete" }
  | { type: "eoa_connect"; connector?: Connector; error?: Error }
  // todo: possibly add another step here for sol?
  | { type: "wallet_connect"; error?: Error }
  | { type: "pick_eoa" };

type AuthContextType<
  TType extends AuthStep["type"] | undefined = AuthStep["type"] | undefined,
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
  undefined,
);

export function useAuthContext<
  TType extends AuthStep["type"] | undefined = AuthStep["type"] | undefined,
>(type?: TType): AuthContextType<TType>;

/**
 * A custom hook that provides the authentication context based on the specified authentication step type. It ensures that the hook is used within an `AuthModalProvider` and throws an error if the context is not available or if the current auth step type does not match the expected type.
 *
 * @example
 * ```tsx twoslash
 * import { useAuthContext } from "@account-kit/react";
 *
 * const { authStep } = useAuthContext();
 * ```
 *
 * @param {AuthStep["type"]} [type] Optional type of authentication step to validate against the current context
 * @returns {AuthContextType} The authentication context for the current component
 * @throws Will throw an error if the hook is not used within an `AuthModalProvider` or if the current auth step type does not match the expected type
 */ export function useAuthContext(
  type?: AuthStep["type"] | undefined,
): AuthContextType {
  const context = useOptionalAuthContext();

  if (!context) {
    throw new Error(
      "useAuthModalContext must be used within a AuthModalProvider",
    );
  }

  if (type && context.authStep.type !== type) {
    throw new Error(`expected authstep to be ${type}`);
  }

  return context;
}

export const useOptionalAuthContext = (): AuthContextType | undefined =>
  useContext(AuthModalContext);
