import { useEffect, useRef } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignup(onSignup: () => void, enabled?: boolean) {
  const hasHandled = useRef(false);
  const signer = useSigner();

  useEffect(() => {
    if (!enabled) return;
    if (!signer) return;

    const handleSignup = () => {
      if (!hasHandled.current) {
        hasHandled.current = true;
        onSignup();
      }
    };

    const stopListening = signer.on("newUserSignup", handleSignup);
    return stopListening;
  }, [enabled, onSignup, signer]);
}
