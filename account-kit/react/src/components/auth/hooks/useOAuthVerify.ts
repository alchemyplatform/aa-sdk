"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useAuthContext } from "../context.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";

export type UseOAuthVerifyReturnType = {
  authenticate: () => void;
  isPending: boolean;
};

export const useOAuthVerify = (): UseOAuthVerifyReturnType => {
  const { setAuthStep } = useAuthContext();
  const { supportUrl } = useUiConfig();

  const { authenticateAsync: authenticateAsync_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({
        type: "oauth_completing",
        provider: "google",
        supportUrl: supportUrl,
      });
    },
    onError: (err) => {
      setAuthStep({
        type: "oauth_completing",
        provider: "google",
        supportUrl: supportUrl,
        error: err,
      });
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  const authenticateAsync = useCallback(() => {
    authenticateAsync_({
      type: "oauth",
      authProviderId: "google",
      mode: "popup",
    });
  }, [authenticateAsync_]);

  return {
    isPending,
    authenticate: authenticateAsync,
  };
};
