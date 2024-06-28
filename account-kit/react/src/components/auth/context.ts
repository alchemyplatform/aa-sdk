import type { Connector } from "@wagmi/core";
import { createContext, useContext } from "react";

export type AuthStep =
  | { type: "email_verify"; email: string }
  | { type: "passkey_verify"; error?: Error }
  | { type: "passkey_create" }
  | { type: "passkey_create_success" }
  | { type: "email_completing"; createPasskeyAfter?: boolean }
  | { type: "initial" }
  | { type: "complete" }
  | { type: "eoa_connect"; connector: Connector; error?: Error };

type AuthContextType = {
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
};

export const AuthModalContext = createContext<AuthContextType | undefined>(
  undefined
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error(
      "useAuthModalContext must be used within a AuthModalProvider"
    );
  }

  return context;
};
