import { AuthClient } from "@alchemy/signer";
import { IframeStamper } from "@turnkey/iframe-stamper";

/**
 * Configuration parameters for creating a web-based authentication client.
 */
export type WebAuthClientParams = {
  /** The API key for authentication with Alchemy services */
  apiKey: string;
  /** The ID for the iframe element used by Turnkey. Defaults to "turnkey-iframe" */
  iframeElementId?: string;
  /** The ID for the container element that will hold the iframe. Defaults to "turnkey-iframe-container" */
  iframeContainerId?: string;
};

/**
 * Creates a web-based authentication client configured for browser environments.
 *
 * This function sets up an AuthClient with Turnkey's IframeStamper for secure key management
 * in web applications. The iframe is automatically created and managed in the DOM.
 *
 * @example
 * ```ts
 * import { createWebAuthClient } from "@alchemy/signer-web";
 *
 * const authClient = createWebAuthClient({
 *   apiKey: "your-api-key",
 *   iframeElementId: "my-turnkey-iframe",
 *   iframeContainerId: "my-iframe-container"
 * });
 *
 * // Send OTP via email
 * await authClient.sendEmailOtp({ email: "user@example.com" });
 *
 * // Submit OTP code to authenticate
 * const signer = await authClient.submitOtpCode({ otpCode: "123456" });
 * ```
 *
 * @param {WebAuthClientParams} params - Configuration parameters for the auth client
 * @param {string} params.apiKey - The API key for authentication with Alchemy services
 * @param {string} [params.iframeElementId] - The ID for the iframe element used by Turnkey
 * @param {string} [params.iframeContainerId] - The ID for the container element that will hold the iframe
 * @returns {AuthClient} A configured AuthClient instance ready for web-based authentication
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
    handleOauthFlow: () => Promise.reject(new Error("Not implemented")),
  });
}
