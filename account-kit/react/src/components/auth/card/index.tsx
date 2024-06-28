"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useAuthError } from "../../../hooks/useAuthError.js";
import { useAuthModal } from "../../../hooks/useAuthModal.js";
import { useElementHeight } from "../../../hooks/useElementHeight.js";
import { useSigner } from "../../../hooks/useSigner.js";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { Navigation } from "../../navigation.js";
import { Notification } from "../../notification.js";
import { useAuthContext } from "../context.js";
import { Step } from "./steps.js";

export type AuthCardProps = {
  className?: string;
};

/**
 * React component containing an Auth view with configured auth methods
 * and options based on the config passed to the AlchemyAccountProvider
 *
 * @example
 * ```tsx
 * import { AuthCard, useAlchemyAccountContext } from "@account-kit/react";
 *
 * function ComponentWithAuthCard() {
 *  // assumes you've passed in a UI config to the Account Provider
 *  // you can also directly set the properties on the AuthCard component
 *  const { uiConfig } = useAlchemyAccountContext();
 *
 *  return (
 *    <AuthCard { ...uiConfig!.auth } />
 *  );
 * }
 * ```
 *
 * @param {AuthCardProps} props Card Props
 * @returns {JSX.Element} a react component containing the AuthCard
 */
export const AuthCard = (props: AuthCardProps) => {
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
  const { authStep, setAuthStep } = useAuthContext();

  const signer = useSigner();
  const error = useAuthError();

  const contentRef = useRef<HTMLDivElement>(null);
  const { height } = useElementHeight(contentRef);

  const didGoBack = useRef(false);

  const {
    auth: { hideError, onAuthSuccess },
  } = useUiConfig();

  const canGoBack = useMemo(() => {
    return ["email_verify", "passkey_verify"].includes(authStep.type);
  }, [authStep]);

  const onBack = useCallback(() => {
    switch (authStep.type) {
      case "email_verify":
      case "passkey_verify":
        signer?.disconnect(); // Terminate any inflight authentication
        didGoBack.current = true;
        setAuthStep({ type: "initial" });
        break;
      default:
        console.warn("Unhandled back action for auth step", authStep);
    }
  }, [authStep, setAuthStep, signer]);

  useLayoutEffect(() => {
    if (authStep.type === "complete") {
      didGoBack.current = false;
      closeAuthModal();
      onAuthSuccess?.();
    } else if (authStep.type !== "initial") {
      didGoBack.current = false;
    } else if (!didGoBack.current && isAuthenticating) {
      // Auth step must be initial
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
          <Step />
        </div>
      </div>
    </div>
  );
};
