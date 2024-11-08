import { useEffect } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignupEffect(onSignup: () => void) {
  const signer = useSigner();

  useEffect(() => {
    if (!signer) return;

    signer.on("newUserSignup", onSignup);
  }, [onSignup, signer]);
}
