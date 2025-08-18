import { AuthClient } from "@alchemy/signer";
import { IframeStamper } from "@turnkey/iframe-stamper";
import { OauthCancelledError } from "../../signer/src/errors.js";

const CHECK_CLOSE_INTERVAL = 500;

export type WebAuthClientParams = {
  apiKey: string;
  iframeElementId?: string;
  iframeContainerId?: string;
};

// TODO: take a transport instead of apiKey once it's ready.
export function createWebAuthClient({
  apiKey,
  iframeElementId = "turnkey-iframe",
  iframeContainerId = "turnkey-iframe-container",
}: WebAuthClientParams): AuthClient {
  const getOrCreateIframeContainer = () => {
    let iframeContainer = document.getElementById(iframeContainerId);
    if (!iframeContainer) {
      iframeContainer = document.createElement("div");
      iframeContainer.id = iframeContainerId;
      iframeContainer.style.display = "none";
      document.body.appendChild(iframeContainer);
    }
    return iframeContainer;
  };

  return new AuthClient({
    apiKey,

    createTekStamper: async () => {
      const iframeContainer = getOrCreateIframeContainer();
      return new IframeStamper({
        iframeUrl: "https://auth.turnkey.com",
        iframeElementId,
        iframeContainer,
      });
    },

    createWebAuthnStamper: () => Promise.reject(new Error("Not implemented")),
    handleOauthFlow: async (authUrl) => {
      const popup = window.open(
      authUrl,
      "_blank",
      "popup,width=500,height=600",
    );
    const eventEmitter = this.eventEmitter;
    return new Promise((resolve, reject) => {
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
        if (alchemyError) {
          cleanup();
          popup?.close();
          reject(new (alchemyError));
        }
        if (!status) {
          // This message isn't meant for us.
          return;
        }
        cleanup();
        popup?.close();

        /*
          export type OAuthFlowResponse = {
            status: "SUCCESS" | "ACCOUNT_LINKING_CONFIRMATION_REQUIRED";
            bundle?: string;
            orgId?: string;
            idToken?: string;
            email?: string;
            providerName?: string;
            otpId?: string;
            error?: string;
          };
        */
        switch (status) {
          case "SUCCESS":
            return {
              status,
              bundle,
              orgId,
              connectedEventName: "connectedOauth",
              idToken,
              authenticatingType: "oauth",
            }
          case "ACCOUNT_LINKING_CONFIRMATION_REQUIRED":
            return {
              status,
              idToken,
              email,
              providerName,
              otpId,
              orgId,
            }
          default:
            reject(new Error(`Unknown status: ${status}`));
        }
      }; // handleMessage

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
    }  
  });
}
