import type { HandleOauthFlowFn } from "../../signer/src/types.js";
import {
  OauthCancelledError,
  // OauthFailedError,
} from "../../signer/src/error.js";

const CHECK_CLOSE_INTERVAL = 500;

export const handleOauthFlow: HandleOauthFlowFn = async (authUrl: string) => {
  // we will use the popup mode for now
  const popup = window.open(authUrl, "_blank", "popup,width=500,height=600");
  return new Promise((_, reject) => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) {
        return;
      }
      const {
        alchemyStatus: status,
        alchemyBundle: bundle,
        alchemyOrgId: orgId,
        alchemyIdToken: idToken,
        alchemyIsSignup: isSignup,
        alchemyError,
        alchemyOtpId: otpId,
        alchemyEmail: email,
        alchemyAuthProvider: providerName,
      } = event.data;
      console.log({ isSignup }); // TO DO: remove, just used for using this var
      if (alchemyError) {
        cleanup();
        popup?.close();
        // reject(new OauthFailedError(alchemyError));
        console.error("OAuth flow failed:", alchemyError);
      }
      if (!status) {
        // This message isn't meant for us.
        return;
      }
      cleanup();
      popup?.close();
      switch (status) {
        case "SUCCESS":
          return {
            status,
            bundle,
            orgId,
            connectedEventName: "connectedOauth",
            idToken,
            authenticatingType: "oauth",
          };
        case "ACCOUNT_LINKING_CONFIRMATION_REQUIRED":
          return {
            status,
            idToken,
            email,
            providerName,
            otpId,
            orgId,
          };
        default:
          reject(new Error(`Unknown status: ${status}`));
          return;
      }
    };

    window.addEventListener("message", handleMessage);

    const checkCloseIntervalId = setInterval(() => {
      if (popup?.closed) {
        cleanup();
        reject(new OauthCancelledError());
      }
    }, CHECK_CLOSE_INTERVAL);

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(checkCloseIntervalId);
    };
  });
};
