import { useLayoutEffect, type ReactNode } from "react";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { Step } from "./steps.js";
import { Notification } from "../../notification.js";
import { useAuthError } from "../../../hooks/useAuthError.js";
import { Navigation } from "../../navigation.js";
import { useAuthModal } from "../../../hooks/useAuthModal.js";

export type AuthCardProps = {
  hideError?: boolean;
  header?: ReactNode;
  showSignInText?: boolean;
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
 * @param props.header optional header for the card (good place to put your app name or logo)
 * @param props.showSignInText optional boolean to show the sign in text (defaults to true)
 * @param props.sections array of sections, each containing an array of auth types
 * @returns a react component containing the AuthCard
 */
export const AuthCard = (
  props: AuthCardProps & { showNavigation?: boolean }
) => {
  const { closeAuthModal } = useAuthModal();
  const { status, isAuthenticating } = useSignerStatus();
  const { authStep, setAuthStep } = useAuthContext();
  const error = useAuthError();

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
  }, [authStep, status, props, isAuthenticating, setAuthStep]);

  return (
    <div className="relative">
      <div
        id="akui-default-error-container"
        className="absolute bottom-[calc(100%+8px)] w-full"
      >
        {!props.hideError && error && error.message && (
          <Notification message={error.message} type="error" />
        )}
      </div>
      <div className="modal-box relative flex flex-col items-center gap-5 text-fg-primary">
        {props.showNavigation && (
          <Navigation showingBack={false} onClose={closeAuthModal} />
        )}
        <Step {...props} />
      </div>
    </div>
  );
};
