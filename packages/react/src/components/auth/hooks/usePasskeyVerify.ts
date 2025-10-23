import { useCallback } from "react";
import { useAuthContext } from "../context.js";
import { useLoginWithPasskey } from "../../../hooks/useLoginWithPasskey.js";

export type UsePasskeyVerifyReturnType = {
  loginWithPasskey: () => void;
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

  const { loginWithPasskey: loginWithPasskey_, isPending } =
    useLoginWithPasskey({
      mutation: {
        onMutate: () => {
          setAuthStep({ type: "passkey_verify" });
        },
        onError: (err) => {
          setAuthStep({ type: "passkey_verify", error: err });
        },
        onSuccess: () => {
          setAuthStep({ type: "complete" });
        },
      },
    });

  const loginWithPasskey = useCallback(
    () => loginWithPasskey_({}),
    [loginWithPasskey_],
  );

  return {
    isPending,
    loginWithPasskey,
  };
};
