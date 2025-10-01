import { useEffect, useRef, useState } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignup(onSignup: () => void, enabled = true) {
  const hasHandled = useRef(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const signer = useSigner();
  useEffect(() => {
    const stopListening = signer?.on("newUserSignup", () => {
      setIsNewUser(true);
    });
    return stopListening;
  }, [signer]);

  useEffect(() => {
    const stopListening = signer?.on("disconnected", () => {
      hasHandled.current = false;
    });
    return stopListening;
  }, [signer]);

  useEffect(() => {
    if (!enabled) return;
    if (!signer) return;
    if (hasHandled.current) return;
    if (isNewUser) {
      onSignup();
      hasHandled.current = true;
    }
  }, [enabled, isNewUser, onSignup, signer]);
}
