import { useEffect, useState } from "react";
import { useSigner } from "../useSigner.js";

export function useNewUserSignup(): boolean {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const signer = useSigner();

  useEffect(() => {
    if (!signer) return;

    signer.on("newUserSignup", () => setIsSignup(true));
  }, [signer]);

  return isSignup;
}
