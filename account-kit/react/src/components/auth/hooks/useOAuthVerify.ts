"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useAuthContext, type AuthStep } from "../context.js";
import type { AuthType } from "../types.js";

export type UseOAuthVerifyReturnType = {
  authenticate: (config: Extract<AuthType, { type: "social" }>) => void;
  isPending: boolean;
};

export const useOAuthVerify = (): UseOAuthVerifyReturnType => {
  const { authStep: _authStep, setAuthStep } = useAuthContext();
  const authStep = _authStep as Extract<AuthStep, { type: "oauth_completing" }>;

  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onError: (err) => {
      setAuthStep({
        type: "oauth_completing",
        config: authStep.config,
        error: err,
        ...(authStep.config.authProviderId === "auth0" && {
          logoUrl: authStep.config.logoUrl,
        }),
      });
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  const authenticate = useCallback(
    (config: Extract<AuthType, { type: "social" }>) => {
      setAuthStep({
        config,
        type: "oauth_completing",
      });
      authenticate_({
        ...config,
        type: "oauth",
      });
    },
    [authenticate_, authStep, setAuthStep]
  );

  return {
    isPending,
    authenticate: authenticate,
  };
};
