import {
  AuthClient,
  OauthCancelledError,
  type CreateTekStamperFn,
  type CreateWebAuthnStamperFn,
} from "@alchemy/auth";
import { IframeStamper } from "@turnkey/iframe-stamper";

const CHECK_CLOSE_INTERVAL = 500;

export type WebAuthClientParams = {
  /** API key for authentication with Alchemy services */
  apiKey: string;
  /** Optional ID for the iframe element used by Turnkey stamper. Defaults to "turnkey-iframe" */
  iframeElementId?: string;
  /** Optional ID for the container element that holds the iframe. Defaults to "turnkey-iframe-container" */
  iframeContainerId?: string;
  /** Optional custom TEK stamper factory for React Native */
  createTekStamper?: CreateTekStamperFn;
  /** Optional custom WebAuthn stamper factory */
  createWebAuthnStamper?: CreateWebAuthnStamperFn;
};

/**
 * Creates a web-based AuthClient configured for browser environments.
 * This function sets up an AuthClient with iframe-based TEK stamper for secure key management
 * and popup-based OAuth flow for social authentication.
 *
 * The created AuthClient supports:
 * - Email OTP authentication (creates TurnkeyClient with iframe TEK stamper)
 * - OAuth authentication via popup windows (creates TurnkeyClient with iframe TEK stamper)
 * - Passkey authentication (creates TurnkeyClient with WebAuthn stamper)
 * - Secure key management through Turnkey
 *
 * @param {WebAuthClientParams} params - Configuration parameters for the web auth client
 * @param {string} params.apiKey - API key for authentication with Alchemy services
 * @param {string} [params.iframeElementId] - ID for the iframe element used by Turnkey stamper
 * @param {string} [params.iframeContainerId] - ID for the container element that holds the iframe
 * @param {CreateTekStamperFn} [params.createTekStamper] - Optional custom TEK stamper factory
 * @param {CreateWebAuthnStamperFn} [params.createWebAuthnStamper] - Optional custom WebAuthn stamper factory
 * @returns {AuthClient} A configured AuthClient instance ready for web-based authentication
 *
 * @example
 * ```ts
 * import { createWebAuthClient } from "@alchemy/auth-web";
 *
 * const authClient = createWebAuthClient({
 *   apiKey: "your-alchemy-api-key",
 *   iframeContainerId: "my-iframe-container"
 * });
 *
 * // Send email OTP
 * await authClient.sendEmailOtp({ email: "user@example.com" });
 *
 * // Submit OTP code - creates AuthSession with TurnkeyClient
 * const authSession = await authClient.submitOtpCode({ otpCode: "123456" });
 *
 * // OAuth login - creates AuthSession with TurnkeyClient
 * const authSession = await authClient.loginWithOauth({
 *   type: "oauth",
 *   authProviderId: "google",
 *   mode: "popup"
 * });
 *
 * // Passkey login - creates AuthSession with TurnkeyClient using WebAuthn stamper
 * const passkeySession = await authClient.loginWithPasskey({
 *   username: "user@example.com"
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
  createTekStamper,
  createWebAuthnStamper,
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

  return AuthClient.create({
    apiKey,

    createTekStamper:
      createTekStamper ??
      (async () => {
        const iframeContainer = getOrCreateIframeContainer();
        return new IframeStamper({
          iframeUrl: "https://auth.turnkey.com",
          iframeElementId,
          iframeContainer,
        });
      }),

    createWebAuthnStamper:
      createWebAuthnStamper ??
      (async (params) => {
        const { WebauthnStamper } = await import("@turnkey/webauthn-stamper");

        const stamper = new WebauthnStamper({
          rpId: params.rpId ?? window.location.hostname,
        });

        // If credentialId is provided, configure allowed credentials for this specific passkey
        if (params.credentialId) {
          stamper.allowCredentials = [
            {
              id: Buffer.from(params.credentialId, "base64"),
              type: "public-key",
              transports: ["internal", "hybrid"],
            },
          ];
        }

        return stamper;
      }),
    handleOauthFlow: async (
      authUrl: Promise<string> | string,
      mode: "redirect" | "popup",
    ) => {
      switch (mode) {
        case "popup":
          // Open popup immediately to avoid popup blockers
          const popup = window.open(
            "about:blank",
            "oauth-popup",
            "width=500,height=600",
          );
          setPopupLoadingPage(popup);

          // Wait for auth URL to be ready, then set url in popup
          const finalAuthUrl = await authUrl;

          if (!popup) {
            throw new Error(
              "Popup blocked by browser. Please allow popups for this site.",
            );
          }

          popup.location.href = finalAuthUrl;

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
                // alchemyIsSignup: isSignup, TO DO: use when implementing the option to add passkey after a new signup with oauth
                alchemyError,
                alchemyOtpId: otpId,
                alchemyEmail: email,
                alchemyAuthProvider: providerName,
              } = event.data;
              if (alchemyError) {
                cleanup();
                popup?.close();
                reject(alchemyError);
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

        case "redirect":
          // No OAuth callback detected, so initiate the redirect
          if (typeof authUrl !== "string") {
            throw new Error("authUrl must be a string in redirect mode");
          }
          window.location.href = authUrl;
          return new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Redirecting to OAuth provider...")),
              1000,
            ),
          );
        default:
          throw new Error(`Unsupported OAuth mode: ${mode}`);
      }
    },
  });
}

function setPopupLoadingPage(popup: Window | null): void {
  const doc = popup?.document;
  if (!doc) {
    throw new Error("Popup closed");
  }
  if (doc.body) {
    // body already exists → just replace contents
    doc.body.textContent = "Loading sign-in...";
    doc.body.style.cssText =
      "font:12px system-ui; margin:0; padding:0; display:flex; align-items:center; justify-content:center; height:100vh;";
  } else {
    // no body yet → create one and append
    const body = doc.createElement("body");
    const p = doc.createElement("p");
    p.textContent = "Loading sign-in...";
    p.style.cssText = "font:12px system-ui; margin:0;";
    body.style.cssText =
      "margin:0; padding:0; display:flex; align-items:center; justify-content:center; height:100vh;";
    body.appendChild(p);
    doc.appendChild(body);
  }
}
