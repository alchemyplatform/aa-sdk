"use client";
import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { AuthStepType, useAuthContext } from "../context.js";
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
        type: AuthStepType.OauthCompleting,
      });
    },
    onError: (err) => {
      console.error(err);
      setAuthStep({
        type: AuthStepType.OauthCompleting,
        config,
        error: err,
      });
    },
    onSuccess: () => {
      setAuthStep({ type: AuthStepType.Complete });
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
