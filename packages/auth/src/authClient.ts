import { AlchemyRestClient } from "@alchemy/common";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import { AuthSession } from "./authSession.js";
import type {
  AuthSessionState,
  AuthType,
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  TurnkeyTekStamper,
} from "./types.js";
import { getOauthNonce, getOauthProviderUrl } from "./utils.js";
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().optional(),
  orgId: z.string(),
  userId: z.string(),
  address: z.string(),
  solanaAddress: z.string().optional(),
  credentialId: z.string().optional(),
  idToken: z.string().optional(),
  claims: z.record(z.unknown()).optional(),
});

const AuthSessionStateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("passkey"),
    user: UserSchema,
    expirationDateMs: z.number(),
    credentialId: z.string().optional(),
  }),
  z.object({
    type: z.enum(["email", "oauth", "otp"]),
    bundle: z.string(),
    user: UserSchema,
    expirationDateMs: z.number(),
  }),
]);

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
 * Reads and removes the specified query params from the URL.
 *
 * @param {T} keys object whose values are the query parameter keys to read and
 * remove
 * @returns {{ [K in keyof T]: string | undefined }} object with the same keys
 * as the input whose values are the values of the query params.
 */
function getAndRemoveQueryParams<T extends Record<string, string>>(
  keys: T,
): { [K in keyof T]: string | undefined } {
  const url = new URL(window.location.href);
  const result: Record<string, string | undefined> = {};
  let foundQueryParam = false;
  for (const [key, param] of Object.entries(keys)) {
    const value = url.searchParams.get(param) ?? undefined;
    foundQueryParam ||= value != null;
    result[key] = value;
    url.searchParams.delete(param);
  }
  if (foundQueryParam) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
  return result as { [K in keyof T]: string | undefined };
}

/**
 * Attempts to extract OAuth callback parameters from the current URL.
 * Returns the extracted parameters if this appears to be an OAuth callback,
 * or null if no OAuth parameters are found.
 *
 * @returns {object | null} OAuth callback parameters or null if not a callback
 */
function extractOAuthCallbackParams() {
  const qpStructure = {
    status: "alchemy-status",
    oauthBundle: "alchemy-bundle",
    oauthOrgId: "alchemy-org-id",
    idToken: "alchemy-id-token",
    isSignup: "aa-is-signup",
    otpId: "alchemy-otp-id",
    email: "alchemy-email",
    authProvider: "alchemy-auth-provider",
    oauthError: "alchemy-error",
  };

  const {
    status,
    oauthBundle,
    oauthOrgId,
    idToken,
    isSignup,
    otpId,
    email,
    authProvider,
    oauthError,
  } = getAndRemoveQueryParams(qpStructure);

  // Check if this is an OAuth callback by looking for required OAuth parameters
  if (oauthBundle && oauthOrgId && idToken) {
    return {
      status: "SUCCESS" as const,
      bundle: oauthBundle,
      orgId: oauthOrgId,
      idToken,
      isSignup: isSignup === "true",
    };
  }

  // Check for OAuth error
  if (oauthError) {
    return {
      status: "ERROR" as const,
      error: oauthError,
    };
  }

  // Check for account linking prompt
  if (
    status === "ACCOUNT_LINKING_CONFIRMATION_REQUIRED" &&
    idToken &&
    email &&
    authProvider &&
    otpId &&
    oauthOrgId
  ) {
    return {
      status: "ACCOUNT_LINKING_CONFIRMATION_REQUIRED" as const,
      idToken,
      email,
      providerName: authProvider,
      otpId,
      orgId: oauthOrgId,
    };
  }

  return null;
}

/**
 * AuthClient handles authentication flows including email OTP, OAuth, and passkey authentication.
 * This is a simplified authentication client that provides methods for different authentication types.
 *
 * @example
 * ```ts twoslash
 * const authClient = new AuthClient({
 *   apiKey: "your-api-key",
 *   createTekStamper: () => createIframeTekStamper(),
 *   createWebAuthnStamper: () => createWebAuthnStamper(),
 *   handleOauthFlow: (url) => handleOAuthPopup(url)
 * });
 *
 * // Send email OTP
 * await authClient.sendEmailOtp({ email: "user@example.com" });
 *
 * // Submit OTP code
 * const authSession = await authClient.submitOtpCode({ otpCode: "123456" });
 * ```
 */
export class AuthClient {
  private constructor(
    private readonly signerHttpClient: AlchemyRestClient<SignerHttpSchema>,
    private readonly createTekStamper: CreateTekStamperFn,
    private readonly createWebAuthnStamper: CreateWebAuthnStamperFn,
    private readonly handleOauthFlow: HandleOauthFlowFn,
  ) {}

  /**
   * Creates a new AuthClient instance
   *
   * @param {AuthClientParams} params - Configuration parameters for the auth client
   * @param {string} params.apiKey - API key for authentication with Alchemy services
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
    );
  }

  private tekStamperPromise: Promise<TekStamperAndPublicKey> | null = null;

  // TODO: do we care about persisting this across reloads?
  private pendingOtp: PendingOtp | null = null;

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
  public async sendEmailOtp({ email }: SendEmailOtpParams): Promise<void> {
    const { targetPublicKey } = await this.getTekStamper();
    const { otpId, orgId } = await this.signerHttpClient.request({
      route: "signer/v1/auth",
      method: "POST",
      body: {
        email,
        emailMode: "otp",
        targetPublicKey,
      },
    });
    this.pendingOtp = { otpId: otpId!, orgId };
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
    this.pendingOtp = null;
    return this.completeAuthWithBundle({
      bundle: credentialBundle!,
      orgId,
      authType: "otp",
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
    const { targetPublicKey } = await this.getTekStamper();
    const oauthConfig = await this.signerHttpClient.request({
      route: "signer/v1/prepare-oauth",
      method: "POST",
      body: { nonce: getOauthNonce(targetPublicKey) },
    });
    const authUrl = getOauthProviderUrl({
      oauthParams:
        params.mode === "redirect" ? { ...params, redirectUrl: "/" } : params, // TO DO: clean up redirect vs popup path
      turnkeyPublicKey: targetPublicKey,
      oauthCallbackUrl: "https://signer.alchemy.com/callback",
      oauthConfig,
    });
    const response = await this.handleOauthFlow(authUrl, params.mode);
    console.log({ response });
    if (response.status === "SUCCESS") {
      console.log("completeAuthWithBundle", {
        bundle: response.bundle,
        orgId: response.orgId,
        idToken: response.idToken,
      });
      return this.completeAuthWithBundle({
        bundle: response.bundle!,
        orgId: response.orgId!,
        idToken: response.idToken,
        authType: "oauth",
      });
    } else if (response.status === "ACCOUNT_LINKING_CONFIRMATION_REQUIRED") {
      // TODO: decide what to do here.
      throw new Error("Account linking confirmation required");
    } else {
      throw new Error(`Unknown OAuth flow response: ${response.status}`);
    }
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
    // // First, check if we're currently on a page with OAuth callback parameters
    const callbackParams = extractOAuthCallbackParams();
    if (callbackParams) {
      // We're on the OAuth callback - return the extracted parameters
      if (callbackParams.status === "ERROR") {
        throw new Error(callbackParams.error);
      }
      return this.completeAuthWithBundle({
        bundle: callbackParams.bundle!,
        orgId: callbackParams.orgId!,
        idToken: callbackParams.idToken,
        authType: "oauth",
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
   * @param {string} [credentialId] - Optional credential ID for authenticating with existing passkey
   * @returns {Promise<AuthSession>} Promise that resolves to an auth session instance
   *
   * @example
   * ```ts twoslash
   * // New passkey authentication
   * const authSession = await authClient.loginWithPasskey();
   *
   * // Authenticate with existing passkey
   * const authSession = await authClient.loginWithPasskey("existing-credential-id");
   * ```
   */
  public async loginWithPasskey(credentialId?: string): Promise<AuthSession> {
    // TODO: figure out what the current passkey code is doing.
    // For new passkey authentication, credentialId would be undefined initially
    const stamper = await this.createWebAuthnStamper({
      credentialId,
    });
    return notImplemented(stamper);
  }

  /**
   * Creates an instance of AuthSession from a previously saved authentication session state that has not expired.
   *
   * This method takes a JSON string representation of a serialized AuthSessionState (typically obtained
   * from AuthSession.getSerializedState()) and attempts to restore the authentication session.
   * The method will validate the session expiration and handle different authentication types appropriately.
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
      return await this.loginWithPasskey(credentialId);
    }
    const { bundle } = parsedState;
    const { orgId, idToken } = user;
    return await this.completeAuthWithBundle({
      bundle,
      orgId,
      idToken,
      authType: type,
    });
  }

  // TODO: ... and many more.

  private async completeAuthWithBundle({
    bundle,
    orgId,
    idToken,
    authType,
  }: {
    bundle: string;
    orgId: string;
    idToken?: string;
    authType: Exclude<AuthType, "passkey">;
  }): Promise<AuthSession> {
    const { stamper } = await this.getTekStamper();
    const success = await stamper.injectCredentialBundle(bundle);
    if (!success) {
      throw new Error("Failed to inject credential bundle");
    }
    const authSession = await AuthSession.create({
      signerHttpClient: this.signerHttpClient,
      stamper,
      orgId,
      idToken,
      bundle,
      authType,
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
}
function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
