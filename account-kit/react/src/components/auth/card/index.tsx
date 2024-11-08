"use client";

import { disconnect } from "@account-kit/core";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
} from "react";
import { useAlchemyAccountContext } from "../../../context.js";
import { useAuthConfig } from "../../../hooks/internal/useAuthConfig.js";
import { useAuthModal } from "../../../hooks/useAuthModal.js";
import { useElementHeight } from "../../../hooks/useElementHeight.js";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { Navigation } from "../../navigation.js";
import { useAuthContext } from "../context.js";
import { usePrevious } from "../hooks/usePrevious.js";
import { Footer } from "../sections/Footer.js";
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
  const { openAuthModal, closeAuthModal } = useAuthModal();
  const { status, isAuthenticating, isConnected } = useSignerStatus();
  const previousStatus = usePrevious(status);
  const { authStep, setAuthStep } = useAuthContext();
  const { config } = useAlchemyAccountContext();

  const didGoBack = useRef(false);

  const { onAuthSuccess, addPasskeyOnSignup } = useAuthConfig(
    ({ onAuthSuccess, addPasskeyOnSignup }) => ({
      onAuthSuccess,
      addPasskeyOnSignup,
    })
  );

  const canGoBack = useMemo(() => {
    return [
      "email_verify",
      "passkey_verify",
      "passkey_create",
      "pick_eoa",
      "wallet_connect",
      "eoa_connect",
      "oauth_completing",
    ].includes(authStep.type);
  }, [authStep]);

  const onBack = useCallback(() => {
    switch (authStep.type) {
      case "email_verify":
      case "passkey_verify":
      case "passkey_create":
      case "oauth_completing":
        disconnect(config); // Terminate any inflight authentication
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
  }, [authStep, setAuthStep, config]);

  const onClose = useCallback(() => {
    if (!isConnected) {
      // Terminate any inflight authentication
      disconnect(config);
    }

    if (authStep.type === "passkey_create") {
      setAuthStep({ type: "complete" });
    } else {
      setAuthStep({ type: "initial" });
    }
    closeAuthModal();
  }, [isConnected, authStep.type, closeAuthModal, config, setAuthStep]);

  useEffect(() => {
    if (authStep.type === "complete") {
      didGoBack.current = false;
      closeAuthModal();
      onAuthSuccess?.();
    } else if (authStep.type !== "initial") {
      didGoBack.current = false;
    }
  }, [
    authStep,
    status,
    isAuthenticating,
    setAuthStep,
    onAuthSuccess,
    openAuthModal,
    closeAuthModal,
    addPasskeyOnSignup,
    isConnected,
    previousStatus,
  ]);

  return (
    <div className="flex flex-col relative">
      {/* Wrapper container that sizes its height dynamically */}
      <DynamicHeight>
        {(canGoBack || showClose) && (
          <Navigation
            showClose={showClose}
            showBack={canGoBack}
            onBack={onBack}
            onClose={onClose}
          />
        )}
        <div
          className={`max-h-[60vh] overflow-auto relative flex flex-col items-center gap-4 text-fg-primary px-6 py-4 ${
            className ?? ""
          }`}
        >
          <Step />
        </div>
        <Footer authStep={authStep} />
      </DynamicHeight>
    </div>
  );
};

const DynamicHeight = ({ children }: PropsWithChildren) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { height } = useElementHeight(contentRef);

  return (
    <div
      className="transition-[flex-basis] duration-200 ease-out overflow-y-hidden radius-2"
      style={{
        flexBasis: height ? `${height}px` : undefined,
      }}
    >
      <div className="z-[1]" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};
