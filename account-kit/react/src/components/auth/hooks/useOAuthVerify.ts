"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useAuthContext, type AuthStep } from "../context.js";
import type { AuthType } from "../types.js";

export type UseOAuthVerifyReturnType = {
  authenticate: () => void;
  isPending: boolean;
};

export const useOAuthVerify = ({
  config,
}: {
  config: Extract<AuthType, { type: "social" }>;
}): UseOAuthVerifyReturnType => {
  const { authStep: _authStep, setAuthStep } = useAuthContext();
  const authStep = _authStep as Extract<AuthStep, { type: "oauth_completing" }>;

  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({
        config,
        type: "oauth_completing",
      });
    },
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

  const authenticate = useCallback(() => {
    authenticate_({
      ...config,
      type: "oauth",
    });
  }, [authenticate_, config]);

  return {
    isPending,
    authenticate: authenticate,
  };
};
