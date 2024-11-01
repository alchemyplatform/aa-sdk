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
  config,
}: {
  config: Extract<AuthType, { type: "social" }>;
}): UseOAuthVerifyReturnType => {
  const { setAuthStep } = useAuthContext();

  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({
        config,
        type: "oauth_completing",
      });
    },
    onError: (err) => {
      console.error(err);
      setAuthStep({
        type: "oauth_completing",
        config,
        error: err,
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
    authenticate,
  };
};
