"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useAuthModal } from "../../../hooks/useAuthModal.js";
import { useElementHeight } from "../../../hooks/useElementHeight.js";
import { useSigner } from "../../../hooks/useSigner.js";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { Navigation } from "../../navigation.js";
import { useAuthContext } from "../context.js";
import { Step } from "./steps.js";
import { Footer } from "../sections/Footer.js";

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

  const contentRef = useRef<HTMLDivElement>(null);
  const { height } = useElementHeight(contentRef);

  const didGoBack = useRef(false);

  const {
    auth: { onAuthSuccess },
  } = useUiConfig();

  const canGoBack = useMemo(() => {
    return [
      "email_verify",
      "passkey_verify",
      "passkey_create",
      "pick_eoa",
      "wallet_connect",
      "eoa_connect",
    ].includes(authStep.type);
  }, [authStep]);

  const onBack = useCallback(() => {
    switch (authStep.type) {
      case "email_verify":
      case "passkey_verify":
      case "passkey_create":
        signer?.disconnect(); // Terminate any inflight authentication
        didGoBack.current = true;
        setAuthStep({ type: "initial" });
        break;
      case "wallet_connect":
      case "eoa_connect":
        setAuthStep({ type: "pick_eoa" });
        break;
      case "pick_eoa":
        setAuthStep({ type: "initial" });
        break;
      default:
        console.warn("Unhandled back action for auth step", authStep);
    }
  }, [authStep, setAuthStep, signer]);

  const onClose = useCallback(() => {
    if (authStep.type === "passkey_create") {
      setAuthStep({ type: "complete" });
    } else {
      setAuthStep({ type: "initial" });
    }
    closeAuthModal();
  }, [authStep.type, closeAuthModal, setAuthStep]);

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
      {/* Wrapper container that sizes its height dynamically */}
      <div
        className="transition-all duration-300 ease-out overflow-y-hidden radius-2"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div className="z-[1]" ref={contentRef}>
          <div
            className={`relative flex flex-col items-center gap-4 text-fg-primary px-6 py-4 ${
              className ?? ""
            }`}
          >
            {(canGoBack || showClose) && (
              <Navigation
                showClose={showClose}
                showBack={canGoBack}
                onBack={onBack}
                onClose={onClose}
              />
            )}
            <Step />
          </div>
          <Footer authStep={authStep} />
        </div>
      </div>
    </div>
  );
};
