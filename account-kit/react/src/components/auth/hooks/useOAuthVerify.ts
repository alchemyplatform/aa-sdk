"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useAuthContext } from "../context.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import type { AuthType } from "../types.js";

export type UseOAuthVerifyReturnType = {
  authenticate: () => void;
  isPending: boolean;
};

export const useOAuthVerify = ({
  type,
  ...config
}: Extract<AuthType, { type: "social" }>): UseOAuthVerifyReturnType => {
  const { setAuthStep } = useAuthContext();
  const { supportUrl } = useUiConfig();

  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({
        type: "oauth_completing",
        provider: "google",
        // We dont need this here, because of useUiConfig can get this from context
        supportUrl: supportUrl,
      });
    },
    onError: (err) => {
      setAuthStep({
        type: "oauth_completing",
        // Parse config.authProviderID unless it's Auth0, the check for auth0Connection(?) for the provider name
        provider: "google",
        // We dont need this here, because of useUiConfig can get this from context
        supportUrl: supportUrl,
        // optionally pass in the logoUrl if Auth0
        error: err,
      });
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  const authenticate = useCallback(() => {
    authenticate_({
      type: "oauth",
      ...config,
      // authProviderId: "google",
      // mode: "popup",
    });
  }, [authenticate_]);

  return {
    isPending,
    authenticate: authenticate,
  };
};
