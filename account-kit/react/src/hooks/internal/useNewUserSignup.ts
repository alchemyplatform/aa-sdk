import { useEffect, useRef } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignupEffect(onSignup: () => void) {
  const hasHandled = useRef(false);
  const signer = useSigner();

  useEffect(() => {
    if (!signer) return;
    if (hasHandled.current) return;

    signer.on("newUserSignup", () => {
      onSignup();
      hasHandled.current = true;
    });
  }, [onSignup, signer]);
}
