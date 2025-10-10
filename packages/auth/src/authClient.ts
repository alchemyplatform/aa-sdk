import { AlchemyRestClient } from "@alchemy/common";
import { TurnkeyClient } from "@turnkey/http";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import { AuthSession } from "./authSession.js";
import type {
  AuthSessionState,
  AuthType,
  CredentialCreationOptionOverrides,
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  OAuthFlowResponse,
  TurnkeyTekStamper,
} from "./types.js";
import {
  DEFAULT_SESSION_EXPIRATION_MS,
  base64UrlEncode,
  getOauthNonce,
  getOauthProviderUrl,
  getWebAuthnAttestationInternal,
  extractOAuthCallbackParams,
  AuthSessionStateSchema,
} from "./utils.js";

/**
 * Configuration parameters for creating an AuthClient instance
 */
export type AuthClientParams = {
  /** API key for authentication with Alchemy services. */
  apiKey?: string;
  /** JWT token for authentication with Alchemy services. */
  jwt?: string;
  /** Custom URL (optional - defaults to Alchemy's chain-agnostic URL, but can be used to override it) */
  url?: string;
  rpId?: string;
  /** Function to create a TEK (Traffic Encryption Key) stamper */
  createTekStamper: CreateTekStamperFn;
  /** Function to create a WebAuthn stamper for passkey authentication */
  createWebAuthnStamper: CreateWebAuthnStamperFn;
  /** Function to handle OAuth authentication flow */
  handleOauthFlow: HandleOauthFlowFn;
};

/**
 * Parameters for sending an email OTP (One-Time Password)
 */
export type SendEmailOtpParams = {
  /** Email address to send the OTP to */
  email: string;
  /** Length of the session in milliseconds. Defaults to 15 minutes. */
  sessionExpirationMs?: number;
};

/**
 * Parameters for submitting an OTP code for verification
 */
export type SubmitOtpCodeParams = {
  /** The OTP code received via email */
  otpCode: string;
};

/**
 * Parameters for OAuth authentication login
 */
export type LoginWithOauthParams = {
  /** Authentication type identifier */
  type: "oauth";
  /** OAuth provider identifier (e.g., "google", "facebook") */
  authProviderId: string;
  /** OAuth scope parameters */
  scope?: string;
  /** OAuth claims parameters */
  claims?: string;
  /** Additional OAuth parameters */
  otherParameters?: Record<string, string>;
  /** OAuth flow mode - popup or redirect */
  mode: "popup" | "redirect";
  /** Length of the session in milliseconds. Defaults to 15 minutes. */
  sessionExpirationMs?: number;
};

export type LoginWithPasskeyParams = {
  email?: string;
  username?: string;
  creationOpts?: CredentialCreationOptionOverrides;
  credentialId?: string;
  sessionExpirationMs?: number;
};

type TekStamperAndPublicKey = {
  stamper: TurnkeyTekStamper;
  targetPublicKey: string;
};

type PendingOtp = {
  otpId: string;
  orgId: string;
};

/**
 * AuthClient handles authentication flows including email OTP, OAuth, and passkey authentication.
 * This is a simplified authentication client that provides methods for different authentication types.
 *
 * The client creates Turnkey clients internally for each authentication flow, using the provided
 * stamper factories (createTekStamper for email/OAuth, createWebAuthnStamper for passkeys).
 *
 * @example
 * ```ts twoslash
 * const authClient = AuthClient.create({
 *   apiKey: "your-api-key",
 *   createTekStamper: () => createIframeTekStamper(),
 *   createWebAuthnStamper: () => createWebAuthnStamper(),
 *   handleOauthFlow: (url) => handleOAuthPopup(url)
 * });
 *
 * // Send email OTP
 * await authClient.sendEmailOtp({ email: "user@example.com" });
 *
 * // Submit OTP code - creates TurnkeyClient with TEK stamper
 * const authSession = await authClient.submitOtpCode({ otpCode: "123456" });
 *
 * // Login with passkey - creates TurnkeyClient with WebAuthn stamper
 * const passkeySession = await authClient.loginWithPasskey({ username: "user@example.com" });
 * ```
 */
export class AuthClient {
  private constructor(
    private readonly signerHttpClient: AlchemyRestClient<SignerHttpSchema>,
    private readonly createTekStamper: CreateTekStamperFn,
    private readonly createWebAuthnStamper: CreateWebAuthnStamperFn,
    private readonly handleOauthFlow: HandleOauthFlowFn,
    private readonly rpId: string | undefined,
  ) {}

  /**
   * Creates a new AuthClient instance
   *
   * @param {AuthClientParams} params - Configuration parameters for the auth client
   * @param {string} [params.apiKey] - API key for authentication with Alchemy services
   * @param {string} [params.jwt] - JWT token for authentication with Alchemy services
   * @param {string} [params.url] - Custom URL (optional - defaults to Alchemy's chain-agnostic URL)
   * @param {string} [params.rpId] - Relying Party ID for WebAuthn operations
   * @param {CreateTekStamperFn} params.createTekStamper - Function to create a TEK stamper
   * @param {CreateWebAuthnStamperFn} params.createWebAuthnStamper - Function to create a WebAuthn stamper
   * @param {HandleOauthFlowFn} params.handleOauthFlow - Function to handle OAuth authentication flow
   * @returns {AuthClient} A new AuthClient instance
   */
  public static create(params: AuthClientParams): AuthClient {
    return new AuthClient(
      new AlchemyRestClient({
        apiKey: params.apiKey,
        jwt: params.jwt,
        url: params.url,
      }),
      params.createTekStamper,
      params.createWebAuthnStamper,
      params.handleOauthFlow,
      params.rpId,
    );
  }

  private tekStamperPromise: Promise<TekStamperAndPublicKey> | null = null;

  private pendingOtp: PendingOtp | null = null;
  private pendingExpirationDateMs: number | null = null;

  private static ROOT_ORG_ID_DEFAULT: string =
    "24c1acf5-810f-41e0-a503-d5d13fa8e830";

  /**
   * Sends an OTP (One-Time Password) to the specified email address for authentication.
   * The OTP will be sent to the user's email and can be submitted using submitOtpCode().
   *
   * @param {SendEmailOtpParams} params - Parameters for sending the email OTP
   * @param {string} params.email - Email address to send the OTP to
   * @returns {Promise<void>} Promise that resolves when the OTP has been sent
   *
   * @example
   * ```ts twoslash
   * await authClient.sendEmailOtp({ email: "user@example.com" });
   * // User will receive an OTP code via email
   * ```
   */
  public async sendEmailOtp({
    email,
    sessionExpirationMs = DEFAULT_SESSION_EXPIRATION_MS,
  }: SendEmailOtpParams): Promise<void> {
    const { targetPublicKey } = await this.getTekStamper();
    const { orgId: existingOrgId } = await this.signerHttpClient.request({
      route: "signer/v1/lookup",
      method: "POST",
      body: { email },
    });
    const expirationDateMs = Date.now() + sessionExpirationMs;
    const expirationSeconds = Math.floor(sessionExpirationMs / 1000);
    const { orgId, otpId } = await (() => {
      if (!existingOrgId) {
        return this.signerHttpClient.request({
          route: "signer/v1/signup",
          method: "POST",
          body: { email, emailMode: "otp", targetPublicKey, expirationSeconds },
        });
      } else {
        return this.signerHttpClient.request({
          route: "signer/v1/auth",
          method: "POST",
          body: { email, emailMode: "otp", targetPublicKey, expirationSeconds },
        });
      }
    })();
    this.pendingOtp = { otpId: otpId!, orgId: orgId };
    this.pendingExpirationDateMs = expirationDateMs;
  }

  /**
   * Submits an OTP code for verification and completes the authentication process.
   * This method should be called after sendEmailOtp() with the code received via email.
   *
   * @param {SubmitOtpCodeParams} params - Parameters for submitting the OTP code
   * @param {string} params.otpCode - The OTP code received via email
   * @returns {Promise<AuthSession>} Promise that resolves to an auth session instance
   *
   * @example
   * ```ts twoslash
   * // First send OTP
   * await authClient.sendEmailOtp({ email: "user@example.com" });
   *
   * // Then submit the code received via email
   * const authSession = await authClient.submitOtpCode({ otpCode: "123456" });
   * ```
   */
  public async submitOtpCode({
    otpCode,
  }: SubmitOtpCodeParams): Promise<AuthSession> {
    if (!this.pendingOtp) {
      throw new Error("Cannot submit OTP code when none has been sent");
    }
    const { otpId, orgId } = this.pendingOtp;
    const { targetPublicKey } = await this.getTekStamper();
    const { credentialBundle } = await this.signerHttpClient.request({
      route: "signer/v1/otp",
      method: "POST",
      body: { otpId, otpCode, orgId, targetPublicKey },
    });
    let expirationDateMs = this.pendingExpirationDateMs;
    if (expirationDateMs == null) {
      console.warn("No expiration date in state for OTP code submission");
      expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
    }
    this.pendingOtp = null;
    this.pendingExpirationDateMs = null;
    return this.completeAuthWithBundle({
      bundle: credentialBundle!,
      orgId,
      authType: "otp",
      expirationDateMs,
    });
  }

  /**
   * Initiates OAuth authentication with the specified provider.
   * This method handles the complete OAuth flow including provider URL generation and response processing.
   *
   * @param {LoginWithOauthParams} params - Parameters for OAuth authentication
   * @param {string} params.authProviderId - OAuth provider identifier (e.g., "google", "facebook")
   * @param {string} [params.scope] - OAuth scope parameters
   * @param {string} [params.claims] - OAuth claims parameters
   * @param {Record<string, string>} [params.otherParameters] - Additional OAuth parameters
   * @param {"popup" | "redirect"} [params.mode] - OAuth flow mode, defaults to "redirect"
   * @returns {Promise<AuthSession>} Promise that resolves to an auth session instance
   *
   * @example
   * ```ts twoslash
   * const authSession = await authClient.loginWithOauth({
   *   type: "oauth",
   *   authProviderId: "google",
   *   mode: "popup"
   * });
   * ```
   */
  public async loginWithOauth(
    params: LoginWithOauthParams,
  ): Promise<AuthSession> {
    const authUrlPromise = this.buildAuthUrl(params);
    const response = await this.handleOauthFlow(
      params.mode === "popup" ? authUrlPromise : await authUrlPromise,
      params.mode,
    );
    return await this.processOAuthResponse(response);
  }

  /**
   * Handles OAuth redirect callback by extracting OAuth parameters from the current URL.
   * This method should be called when the user returns to your application after completing
   * OAuth authentication with a provider (e.g., Google, Facebook).
   *
   * The method automatically detects OAuth callback parameters (alchemy-bundle, alchemy-org-id,
   * alchemy-id-token) in the URL query string, processes them, and completes the authentication flow.
   *
   * @returns {Promise<AuthSession>} Promise that resolves to an auth session instance
   *
   * @example
   * ```ts twoslash
   * // After user returns from OAuth provider with callback URL like:
   * // https://yourapp.com/?alchemy-bundle=eyJ0eXAi...&alchemy-org-id=24c1ac...&alchemy-id-token=eyJ0eXAi...
   *
   * try {
   *   const authSession = await authClient.handleOauthRedirect();
   *   console.log("OAuth authentication successful", authSession.user);
   * } catch (error) {
   *   console.error("OAuth callback failed:", error.message);
   * }
   * ```
   */
  // TO DO: move this to the web auth session client.
  public async handleOauthRedirect(): Promise<AuthSession | null> {
    // First, check if we're currently on a page with OAuth callback parameters
    const callbackParams = extractOAuthCallbackParams();
    if (callbackParams) {
      // We're on the OAuth callback - return the extracted parameters
      if (callbackParams.status === "ERROR") {
        throw new Error(callbackParams.error);
      }
      // TODO: this does not correctly set the expiration date if a nondefault
      // value was chosen. To do so, we would need to store the requested
      // expiration date in page storage to persist it across reloads. It might
      // be better to have the backend return it instead.
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      return this.completeAuthWithBundle({
        bundle: callbackParams.bundle!,
        orgId: callbackParams.orgId!,
        idToken: callbackParams.idToken,
        authType: "oauth",
        expirationDateMs,
      });
    }
    return null;
  }

  /**
   * Initiates passkey (WebAuthn) authentication flow.
   *
   * This method uses WebAuthn standards to authenticate users with biometric or hardware security keys.
   * Can be used for both new passkey creation (when credentialId is undefined) and
   * authentication with existing passkeys (when credentialId is provided).
   *
   * Internally, this method creates a TurnkeyClient with a WebAuthn stamper and uses it to
   * create an AuthSession for the authenticated user.
   *
   * @param {LoginWithPasskeyParams} params - Parameters for passkey authentication
   * @returns {Promise<AuthSession>} Promise that resolves to an auth session instance
   *
   * @example
   * ```ts twoslash
   * // New passkey authentication
   * const authSession = await authClient.loginWithPasskey({ username: "user@example.com" });
   *
   * // Authenticate with existing passkey
   * const authSession = await authClient.loginWithPasskey({
   *   credentialId: "existing-credential-id"
   * });
   * ```
   */
  public async loginWithPasskey(
    params: LoginWithPasskeyParams,
  ): Promise<AuthSession> {
    // For new passkey authentication, credentialId would be undefined initially
    const { email, username, creationOpts, credentialId, sessionExpirationMs } =
      params;

    if (!credentialId) {
      // NEW PASSKEY SIGNUP
      const attestation = await getWebAuthnAttestationInternal(
        {
          username: email || username || "anonymous",
        },
        creationOpts,
      );

      // create Turnkey org
      const result = await this.signerHttpClient.request({
        route: "signer/v1/signup",
        method: "POST",
        body: {
          passkey: {
            challenge: base64UrlEncode(attestation.challenge),
            attestation: attestation.attestation,
          } as any, // TO DO: remove use of as any!!
          email: params?.email,
        },
      });

      // Create stamper for this credential
      const stamper = await this.createWebAuthnStamper({
        credentialId: attestation.attestation.credentialId,
        rpId: this.rpId,
      });

      return AuthSession.create({
        signerHttpClient: this.signerHttpClient,
        turnkey: new TurnkeyClient(
          { baseUrl: "https://api.turnkey.com" },
          stamper,
        ),
        orgId: result.orgId,
        authType: "passkey",
        credentialId: attestation.attestation.credentialId,
        idToken: undefined,
        expirationDateMs:
          Date.now() + (sessionExpirationMs ?? DEFAULT_SESSION_EXPIRATION_MS),
      });
    }

    // EXISTING PASSKEY LOGIN
    const stamper = await this.createWebAuthnStamper({
      credentialId,
      rpId: this.rpId,
    });

    const turnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper,
    );

    // Use root org to lookup user's actual org
    const stampedRequest = await turnkeyClient.stampGetWhoami({
      organizationId: AuthClient.ROOT_ORG_ID_DEFAULT,
    });
    // Stamper signs the whoami request
    // This proves user controls the private key for this credential
    const whoamiResponse = await this.signerHttpClient.request({
      route: "signer/v1/whoami",
      method: "POST",
      body: { stampedRequest },
    });

    return AuthSession.create({
      signerHttpClient: this.signerHttpClient,
      turnkey: turnkeyClient,
      orgId: whoamiResponse.orgId,
      authType: "passkey",
      credentialId: params.credentialId,
      idToken: undefined,
      expirationDateMs:
        Date.now() + (sessionExpirationMs ?? DEFAULT_SESSION_EXPIRATION_MS),
    });
  }

  /**
   * Creates an instance of AuthSession from a previously saved authentication session state that has not expired.
   *
   * This method takes a JSON string representation of a serialized AuthSessionState (typically obtained
   * from AuthSession.getSerializedState()) and attempts to restore the authentication session.
   * The method will validate the session expiration and handle different authentication types appropriately.
   *
   * For each auth type, it creates a new TurnkeyClient with the appropriate stamper:
   * - Email/OAuth/OTP: Uses TEK stamper and injects the credential bundle
   * - Passkey: Uses WebAuthn stamper with the stored credentialId
   *
   * @param {string} state - The serialized authentication session state as a JSON string
   * @returns {Promise<AuthSession | undefined>} A promise that resolves to an AuthSession instance if the session is valid and not expired, undefined if expired
   *
   * @throws {Error} Throws an error if the session state is invalid or if credential injection fails
   * @throws {Error} For passkey authentication, throws if credentialId is missing from the session state
   *
   * @example
   * ```ts twoslash
   * // Restore a session from stored JSON string
   * const sessionJson = localStorage.getItem('authSession');
   * if (sessionJson) {
   *   const authSession = await authClient.restoreAuthSession(sessionJson);
   *   if (authSession) {
   *     console.log('Session restored successfully');
   *   } else {
   *     console.log('Session expired');
   *   }
   * }
   * ```
   */
  public async restoreAuthSession(
    state: string,
  ): Promise<AuthSession | undefined> {
    const parsedState: AuthSessionState = this.deserializeState(state);

    const { type, expirationDateMs, user } = parsedState;
    if (expirationDateMs < Date.now()) {
      return undefined;
    }
    if (type === "passkey") {
      const { credentialId } = parsedState;
      if (!credentialId) {
        throw new Error("Credential ID is required for passkey authentication");
      }
      return await this.loginWithPasskey({ credentialId });
    }
    const { bundle } = parsedState;
    const { orgId, idToken } = user;
    return await this.completeAuthWithBundle({
      bundle,
      orgId,
      idToken,
      authType: type,
      expirationDateMs,
    });
  }

  // TODO: ... and many more.

  private async completeAuthWithBundle({
    bundle,
    orgId,
    idToken,
    authType,
    expirationDateMs,
  }: {
    bundle: string;
    orgId: string;
    idToken?: string;
    authType: Exclude<AuthType, "passkey">;
    expirationDateMs: number;
  }): Promise<AuthSession> {
    const { stamper } = await this.getTekStamper();
    const success = await stamper.injectCredentialBundle(bundle);
    if (!success) {
      throw new Error("Failed to inject credential bundle");
    }
    const authSession = await AuthSession.create({
      signerHttpClient: this.signerHttpClient,
      turnkey: new TurnkeyClient(
        { baseUrl: "https://api.turnkey.com" },
        stamper,
      ),
      orgId,
      idToken,
      bundle,
      authType,
      expirationDateMs,
    });
    // Forget the reference to the TEK stamper, because in some implementations
    // it may become invalid if it is disconnected later. Future logins should
    // use a new stamper.
    this.tekStamperPromise = null;
    return authSession;
  }

  private getTekStamper(): Promise<TekStamperAndPublicKey> {
    if (!this.tekStamperPromise) {
      this.tekStamperPromise = (async () => {
        const stamper = await this.createTekStamper();
        const targetPublicKey = await stamper.init();
        return { stamper, targetPublicKey };
      })();
    }
    return this.tekStamperPromise;
  }

  private deserializeState(serializedState: string): AuthSessionState {
    let parsedState = undefined;
    try {
      parsedState = JSON.parse(serializedState);
    } catch (error) {
      throw new Error("Failed to parse serialized state into JSON format");
    }
    const result = AuthSessionStateSchema.safeParse(parsedState);
    if (!result.success)
      throw new Error("Parsed state is not of type AuthSessionState");
    return parsedState;
  }

  private async buildAuthUrl(params: LoginWithOauthParams): Promise<string> {
    const { targetPublicKey } = await this.getTekStamper();
    const oauthConfig = await this.signerHttpClient.request({
      route: "signer/v1/prepare-oauth",
      method: "POST",
      body: { nonce: getOauthNonce(targetPublicKey) },
    });
    return getOauthProviderUrl({
      oauthParams:
        params.mode === "redirect" ? { ...params, redirectUrl: "/" } : params, // TO DO: clean up redirect vs popup path
      turnkeyPublicKey: targetPublicKey,
      oauthCallbackUrl: "https://signer.alchemy.com/callback",
      oauthConfig,
    });
  }

  private async processOAuthResponse(
    response: OAuthFlowResponse,
  ): Promise<AuthSession> {
    if (response.status === "SUCCESS") {
      let expirationDateMs = this.pendingExpirationDateMs;
      if (expirationDateMs == null) {
        console.warn("No expiration date in state for OAuth response");
        expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      }
      this.pendingExpirationDateMs = null;
      return this.completeAuthWithBundle({
        bundle: response.bundle!,
        orgId: response.orgId!,
        idToken: response.idToken,
        authType: "oauth",
        expirationDateMs,
      });
    } else if (response.status === "ACCOUNT_LINKING_CONFIRMATION_REQUIRED") {
      // TODO: decide what to do here.
      throw new Error("Account linking confirmation required");
    } else {
      throw new Error(`Unknown OAuth flow response: ${response.status}`);
    }
  }
}
