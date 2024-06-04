import { useLayoutEffect, useState, type ReactNode } from "react";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { AuthModalContext, type AuthStep } from "../context.js";
import type { AuthType } from "../types.js";
import { Step } from "./steps.js";

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
  const { status, isAuthenticating } = useSignerStatus();
  const [authStep, setAuthStep] = useState<AuthStep>({
    type: isAuthenticating ? "email_completing" : "initial",
  });

  useLayoutEffect(() => {
    if (authStep.type === "complete") {
      props.onAuthSuccess?.();
    } else if (isAuthenticating && authStep.type === "initial") {
      const urlParams = new URLSearchParams(window.location.search);

      setAuthStep({
        type: "email_completing",
        createPasskeyAfter: urlParams.get(IS_SIGNUP_QP) === "true",
      });
    }
  }, [authStep, status, props, isAuthenticating]);

  return (
    <AuthModalContext.Provider
      value={{
        authStep,
        setAuthStep,
      }}
    >
      <div className="relative">
        <div
          id="akui-default-error-container"
          className="absolute -top-10 w-full"
        ></div>
        <div className="modal-box flex flex-col items-center gap-5">
          <Step {...props} />
        </div>
      </div>
    </AuthModalContext.Provider>
  );
};
