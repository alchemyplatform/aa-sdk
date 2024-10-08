"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useAuthContext } from "../context.js";
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

  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({
        type: "oauth_completing",
        provider:
          config.authProviderId === "auth0"
            ? config.auth0Connection!
            : config.authProviderId,
        ...(config.authProviderId === "auth0" &&
          "logoUrl" in config && { logoUrl: config.logoUrl }),
      });
    },
    onError: (err) => {
      setAuthStep({
        type: "oauth_completing",
        provider:
          config.authProviderId === "auth0"
            ? config.auth0Connection!
            : config.authProviderId,
        error: err,
        ...(config.authProviderId === "auth0" &&
          "logoUrl" in config && { logoUrl: config.logoUrl }),
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
    });
  }, [authenticate_, config]);

  return {
    isPending,
    authenticate: authenticate,
  };
};
