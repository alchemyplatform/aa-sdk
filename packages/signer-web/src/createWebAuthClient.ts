import { AuthClient, OauthCancelledError } from "@alchemy/signer";
import { IframeStamper } from "@turnkey/iframe-stamper";

const CHECK_CLOSE_INTERVAL = 500;

/**
 * Configuration parameters for creating a web-based AuthClient
 */
export type WebAuthClientParams = {
  /** API key for authentication with Alchemy services */
  apiKey: string;
  /** Optional ID for the iframe element used by Turnkey stamper. Defaults to "turnkey-iframe" */
  iframeElementId?: string;
  /** Optional ID for the container element that holds the iframe. Defaults to "turnkey-iframe-container" */
  iframeContainerId?: string;
};

/**
 * Creates a web-based AuthClient configured for browser environments.
 * This function sets up an AuthClient with iframe-based TEK stamper for secure key management
 * and popup-based OAuth flow for social authentication.
 *
 * The created AuthClient supports:
 * - Email OTP authentication
 * - OAuth authentication via popup windows
 * - Secure key management through Turnkey iframe stamper
 *
 * @param {WebAuthClientParams} params - Configuration parameters for the web auth client
 * @param {string} params.apiKey - API key for authentication with Alchemy services
 * @param {string} [params.iframeElementId] - ID for the iframe element used by Turnkey stamper
 * @param {string} [params.iframeContainerId] - ID for the container element that holds the iframe
 * @returns {AuthClient} A configured AuthClient instance ready for web-based authentication
 *
 * @example
 * ```ts
 * import { createWebAuthClient } from "@alchemy/signer-web";
 *
 * const authClient = createWebAuthClient({
 *   apiKey: "your-alchemy-api-key",
 *   iframeContainerId: "my-iframe-container"
 * });
 *
 * // Send email OTP
 * await authClient.sendEmailOtp({ email: "user@example.com" });
 *
 * // Submit OTP code
 * const signer = await authClient.submitOtpCode({ otpCode: "123456" });
 *
 * // OAuth login
 * const signer = await authClient.loginWithOauth({
 *   type: "oauth",
 *   authProviderId: "google",
 *   mode: "popup"
 * });
 * ```
 *
 * @throws {Error} May throw errors related to DOM manipulation or network requests
 *
 * @see {@link AuthClient} for the full API of the returned client
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
    handleOauthFlow: async (authUrl: string, mode: "popup" | "redirect") => {
      switch (mode) {
        case "popup":
          const popup = window.open(
            authUrl,
            "_blank",
            "popup,width=500,height=600"
          );
          // const eventEmitter = this.eventEmitter;
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
              console.log({ isSignup }); // TO DO: remove, added this to get lint to stop complaining
              if (alchemyError) {
                cleanup();
                popup?.close();
                reject(new alchemyError());
              }
              if (!status) {
                // This message isn't meant for us.
                return;
              }
              cleanup();
              popup?.close();
              switch (status) {
                case "SUCCESS":
                  resolve({
                    status,
                    bundle,
                    orgId,
                    // connectedEventName: "connectedOauth",
                    idToken,
                    // authenticatingType: "oauth",
                  });
                  break;
                case "ACCOUNT_LINKING_CONFIRMATION_REQUIRED":
                  resolve({
                    status,
                    idToken,
                    email,
                    providerName,
                    otpId,
                    orgId,
                  });
                  break;
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

        case "redirect":
          // No OAuth callback detected, so initiate the redirect
          window.location.href = authUrl;
          return new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Redirecting to OAuth provider...")),
              1000
            )
          );
        default:
          throw new Error(`Unsupported OAuth mode: ${mode}`);
      }
    },
  });
}
