"use client";

import type { Connector } from "@wagmi/core";
import { createContext, useContext } from "react";
import type { AuthType } from "./types";

export type AuthStep =
  | { type: "email_verify"; email: string }
  | { type: "passkey_verify"; error?: Error }
  | { type: "passkey_create"; error?: Error }
  | { type: "passkey_create_success" }
  | { type: "email_completing"; createPasskeyAfter?: boolean }
  | {
      type: "oauth_completing";
      config: Extract<AuthType, { type: "social" }>;
      error?: Error;
    }
  | { type: "initial"; error?: Error }
  | { type: "complete" }
  | { type: "eoa_connect"; connector: Connector; error?: Error }
  | { type: "wallet_connect"; error?: Error }
  | { type: "pick_eoa" };

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
