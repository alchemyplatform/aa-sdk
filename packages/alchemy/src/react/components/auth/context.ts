import { createContext, useContext } from "react";

export type AuthContext =
  | { type: "email"; email: string }
  | { type: "passkey" };

type AuthModalContextType = {
  authContext?: AuthContext;
  setAuthContext: (context: AuthContext | undefined) => void;
};

export const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const useAuthModalContext = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error(
      "useAuthModalContext must be used within a AuthModalProvider"
    );
  }

  return context;
};
