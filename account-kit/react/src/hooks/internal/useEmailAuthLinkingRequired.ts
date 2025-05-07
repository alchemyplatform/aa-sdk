import { useEffect, useRef } from "react";
import { useSigner } from "../useSigner.js";

export function useEmailAuthLinkingRequired(
  onLinkingRequired: (email: string) => void,
  enabled = true
) {
  const signer = useSigner();

  // Use a reference to the latest value of the callback. We don't want
  // `useEffect` to depend on the callback, as the callback can be a new
  // instance on every call if the caller doesn't memoize and the signer will
  // trigger the event immediately if we resubscribe, potentially leading to an
  // infinite loop of events.
  const onLinkingRequiredRef = useRef(onLinkingRequired);
  onLinkingRequiredRef.current = onLinkingRequired;

  useEffect(() => {
    if (enabled && signer) {
      const cancel = signer.on("emailAuthLinkingRequired", (email) => {
        onLinkingRequiredRef.current(email);
      });
      return cancel;
    }
    return undefined;
  }, [signer, enabled]);
}
