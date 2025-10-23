"use client";
import { useCallback } from "react";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { useLoginWithOauth } from "../../../hooks/useLoginWithOauth.js";

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
  const { loginWithOauth, isPending } = useLoginWithOauth({
    mutation: {
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
    },
  });

  const authenticate = useCallback(() => {
    loginWithOauth({
      ...config,
      provider: config.authProviderId,
    });
  }, [config, loginWithOauth]);

  return {
    isPending,
    authenticate,
  };
};
