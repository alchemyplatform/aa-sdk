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
import { AuthStepType, useAuthContext } from "../context.js";
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
      AuthStepType.email_verify,
      AuthStepType.otp_verify,
      AuthStepType.passkey_verify,
      AuthStepType.passkey_create,
      AuthStepType.pick_eoa,
      AuthStepType.wallet_connect,
      AuthStepType.eoa_connect,
      AuthStepType.oauth_completing,
    ].includes(authStep.type);
  }, [authStep]);

  const onBack = useCallback(() => {
    switch (authStep.type) {
      case AuthStepType.email_verify:
      case AuthStepType.otp_verify:
      case AuthStepType.passkey_verify:
      case AuthStepType.passkey_create:
      case AuthStepType.oauth_completing:
        disconnect(config); // Terminate any inflight authentication
        didGoBack.current = true;
        setAuthStep({ type: AuthStepType.initial });
        break;
      case AuthStepType.wallet_connect:
      case AuthStepType.eoa_connect:
        setAuthStep({ type: AuthStepType.pick_eoa });
        break;
      case AuthStepType.pick_eoa:
        setAuthStep({ type: AuthStepType.initial });
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

    if (authStep.type === AuthStepType.passkey_create) {
      setAuthStep({ type: AuthStepType.complete });
    } else {
      setAuthStep({ type: AuthStepType.initial });
    }
    closeAuthModal();
  }, [isConnected, authStep.type, closeAuthModal, config, setAuthStep]);

  useEffect(() => {
    if (authStep.type === AuthStepType.complete) {
      didGoBack.current = false;
      closeAuthModal();
      onAuthSuccess?.();
    } else if (authStep.type !== AuthStepType.initial) {
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
