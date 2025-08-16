import { AuthClient } from "@alchemy/signer";
import { IframeStamper } from "@turnkey/iframe-stamper";
import {
  OauthCancelledError,
  // OauthFailedError,
} from "../../signer/src/error.js";

const CHECK_CLOSE_INTERVAL = 500;

export type WebAuthClientParams = {
  apiKey: string;
  iframeElementId?: string;
  iframeContainerId?: string;
};

/**
 * Creates a web-based AuthClient instance configured for browser environments.
 * This function sets up an AuthClient with an iframe-based Turnkey stamper for secure
 * cryptographic operations in the browser.
 *
 * @param {WebAuthClientParams} params - Configuration parameters for the web auth client
 * @param {string} params.apiKey - API key for authenticating with the Alchemy service
 * @param {string} [params.iframeElementId] - ID for the Turnkey iframe element
 * @param {string} [params.iframeContainerId] - ID for the container div that holds the iframe
 * @returns {AuthClient} An AuthClient instance configured for web environments
 *
 * @example
 * ```ts
 * import { createWebAuthClient } from "@alchemy/signer-web";
 *
 * const authClient = createWebAuthClient({
 *   apiKey: "your-api-key",
 *   iframeElementId: "custom-iframe-id", // optional
 *   iframeContainerId: "custom-container-id" // optional
 * });
 * ```
 */
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
    handleOauthFlow: async (authUrl: string) => {
      // we will use the popup mode for now
      console.log("Opening popup for OAuth flow:", authUrl);
      const popup = window.open(
        authUrl,
        "_blank",
        "popup,width=500,height=600",
      );
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
    },
  });
}
