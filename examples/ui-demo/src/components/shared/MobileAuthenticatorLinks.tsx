import { useMemo } from "react";
import { AppStore } from "../icons/app-store";
import { GooglePlay } from "../icons/google-play";

export function MobileAuthenticatorLinks() {
  const isIOS = useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);
  const isAndroid = useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }, []);
  return (
    <>
      {isIOS && (
        <a
          className="relative mb-5"
          href="https://apps.apple.com/us/app/google-authenticator/id388497605"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppStore />
        </a>
      )}
      {isAndroid && (
        <a
          className="relative mb-5"
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GooglePlay />
        </a>
      )}
    </>
  );
}
