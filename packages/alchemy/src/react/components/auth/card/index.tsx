import { useEffect, useState, type ReactNode } from "react";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { AuthModalContext, type AuthStep } from "../context.js";
import type { AuthType } from "../types.js";
import { LoadingAuth } from "./loading/index.js";
import { MainAuthContent } from "./main.js";

export type AuthCardProps = {
  header?: ReactNode;
  // Each section can contain multiple auth types which will be grouped together
  // and separated by an OR divider
  sections?: AuthType[][];
  className?: string;
  onAuthSuccess?: () => void;
};

/**
 * React component containing an Auth view with configured auth methods
 *
 * @param props Card Props
 * @param props.header optional header for the card (default: "Sign in")
 * @param props.sections array of sections, each containing an array of auth types
 * @returns a react component containing the AuthCard
 */
export const AuthCard = (props: AuthCardProps) => {
  const [authStep, setAuthStep] = useState<AuthStep>({ type: "initial" });
  const { isAuthenticating } = useSignerStatus();

  useEffect(() => {
    if (authStep.type === "complete") {
      props.onAuthSuccess?.();
    }
  }, [authStep, props]);

  return (
    <AuthModalContext.Provider
      value={{
        authStep,
        setAuthStep,
      }}
    >
      <div className="modal-box flex flex-col items-center gap-5">
        {isAuthenticating ? (
          <LoadingAuth context={authStep} />
        ) : (
          <MainAuthContent {...props} />
        )}
      </div>
    </AuthModalContext.Provider>
  );
};
