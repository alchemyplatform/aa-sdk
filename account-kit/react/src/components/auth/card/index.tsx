import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { useAuthContext } from "../context.js";
import { Step } from "./steps.js";
import { Notification } from "../../notification.js";
import { useAuthError } from "../../../hooks/useAuthError.js";
import { Navigation } from "../../navigation.js";
import { useAuthModal } from "../../../hooks/useAuthModal.js";
import { useElementHeight } from "../../../hooks/useElementHeight.js";
import { MissingUiConfigComponentError } from "../../../errors.js";

export type AlchemyAuthCardProps = {
  className?: string;
};

/**
 * React component containing an Auth view with configured auth methods
 * and options based on the config passed to the AlchemyAccountProvider
 *
 * @param props Card Props
 * @param props.className Optional class name to apply to the card
 * @returns a react component containing the AuthCard
 */
export const AuthCard = (props: AlchemyAuthCardProps) => {
  return <AuthCardContent {...props} />;
};

// this isn't used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const AuthCardContent = ({
  className,
  showClose = false,
}: {
  className?: string;
  showClose?: boolean;
}) => {
  const { closeAuthModal } = useAuthModal();
  const { status, isAuthenticating } = useSignerStatus();
  const { authStep, setAuthStep, uiConfig } = useAuthContext();

  const error = useAuthError();

  const contentRef = useRef<HTMLDivElement>(null);
  const { height } = useElementHeight(contentRef);

  if (!uiConfig) {
    throw new MissingUiConfigComponentError("AuthCard");
  }

  const { hideError, onAuthSuccess } = uiConfig;

  // TODO: Finalize the steps that allow going back
  const canGoBack = useMemo(() => {
    return ["email_verify"].includes(authStep.type);
  }, [authStep]);

  const onBack = useCallback(() => {
    switch (authStep.type) {
      case "email_verify":
        setAuthStep({ type: "initial" });
        break;
      default:
        console.warn("Unhandled back action for auth step", authStep);
    }
  }, [authStep, setAuthStep]);

  useLayoutEffect(() => {
    if (authStep.type === "complete") {
      closeAuthModal();
      onAuthSuccess?.();
    } else if (isAuthenticating && authStep.type === "initial") {
      const urlParams = new URLSearchParams(window.location.search);

      setAuthStep({
        type: "email_completing",
        createPasskeyAfter: urlParams.get(IS_SIGNUP_QP) === "true",
      });
    }
  }, [
    authStep,
    status,
    isAuthenticating,
    setAuthStep,
    onAuthSuccess,
    closeAuthModal,
  ]);

  return (
    <div className="relative">
      <div
        id="akui-default-error-container"
        className="absolute bottom-[calc(100%+8px)] w-full"
      >
        {!hideError && error && error.message && (
          <Notification message={error.message} type="error" />
        )}
      </div>

      {/* Wrapper container that sizes its height dynamically */}
      <div
        className="transition-all duration-300 ease-out overflow-y-hidden"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div
          ref={contentRef}
          className={`modal-box relative flex flex-col items-center gap-5 text-fg-primary ${
            className ?? ""
          }`}
        >
          {(canGoBack || showClose) && (
            <Navigation
              showClose={showClose}
              showBack={canGoBack}
              onBack={onBack}
              onClose={closeAuthModal}
            />
          )}
          <Step config={uiConfig} />
        </div>
      </div>
    </div>
  );
};
