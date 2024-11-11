import { useEffect, useRef } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignup(onSignup: () => void, enabled?: boolean) {
  const hasHandled = useRef(false);
  const signer = useSigner();

  useEffect(() => {
    if (!enabled) return;
    if (!signer) return;
    if (hasHandled.current) return;

    signer.on("newUserSignup", () => {
      onSignup();
      hasHandled.current = true;
    });
  }, [enabled, onSignup, signer]);
}
