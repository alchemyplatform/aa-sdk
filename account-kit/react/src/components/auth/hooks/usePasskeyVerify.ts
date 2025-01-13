import { useCallback } from "react";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { AuthStepType, useAuthContext } from "../context.js";

export type UsePasskeyVerifyReturnType = {
  authenticate: () => void;
  isPending: boolean;
};

/**
 * Internal UI component hook used to complete passkey verification.
 *
 * This is used to log in with a passkey, not create a new passkey
 *
 * @returns {UsePasskeyVerifyReturnType} an authenticate function to do passkey verification and a boolean indicating if the operation is pending
 */
export const usePasskeyVerify = (): UsePasskeyVerifyReturnType => {
  const { setAuthStep } = useAuthContext();
  const { authenticate: authenticate_, isPending } = useAuthenticate({
    onMutate: () => {
      setAuthStep({ type: AuthStepType.PasskeyVerify });
    },
    onError: (err) => {
      setAuthStep({ type: AuthStepType.PasskeyVerify, error: err });
    },
    onSuccess: () => {
      setAuthStep({ type: AuthStepType.Complete });
    },
  });

  const authenticate = useCallback(
    () => authenticate_({ type: "passkey", createNew: false }),
    [authenticate_]
  );

  return {
    isPending,
    authenticate,
  };
};
