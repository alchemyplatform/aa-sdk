import { createContext, useContext } from "react";

export type AuthStep =
  | { type: "email_verify"; email: string }
  | { type: "passkey_verify"; error?: Error }
  | { type: "passkey_create" }
  | { type: "email_completing"; createPasskeyAfter?: boolean }
  | { type: "initial" }
  | { type: "complete" };

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
