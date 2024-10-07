"use client";

import type { Connector } from "@wagmi/core";
import { createContext, useContext } from "react";

export type AuthStep =
  | { type: "email_verify"; email: string }
  | { type: "passkey_verify"; error?: Error }
  | { type: "passkey_create"; error?: Error }
  | { type: "passkey_create_success" }
  | { type: "email_completing"; createPasskeyAfter?: boolean }
  | {
      type: "oauth_completing";
      provider: string;
      supportUrl?: string;
      error?: Error;
    }
  | { type: "initial"; error?: Error }
  | { type: "complete" }
  | { type: "eoa_connect"; connector: Connector; error?: Error }
  | { type: "wallet_connect"; error?: Error }
  | { type: "pick_eoa" };

type AuthContextType = {
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  resetAuthStep: () => void;
};

export const AuthModalContext = createContext<AuthContextType | undefined>(
  undefined
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const useAuthContext = (): AuthContextType => {
  const context = useOptionalAuthContext();

  if (!context) {
    throw new Error(
      "useAuthModalContext must be used within a AuthModalProvider"
    );
  }

  return context;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const useOptionalAuthContext = (): AuthContextType | undefined =>
  useContext(AuthModalContext);
