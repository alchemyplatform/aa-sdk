import { Signer } from "./signer.js";
import type {
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  TurnkeyTekStamper,
} from "./types.js";
import { dev_request } from "./devRequest.js";
import { getOauthNonce, getOauthProviderUrl } from "./utils.js";

/**
 * Configuration parameters for creating an AuthClient instance
 */
export type AuthClientParams = {
  // TODO: put this back when the transport is ready.
  // transport: AlchemyTransport;
  // TODO: this is temporary for testing before the transport is ready.
  /** API key for authentication with Alchemy services */
  apiKey: string;
  /** Function to create a TEK (Turnkey Ephemeral Key) stamper */
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
 * AuthClient handles authentication flows including email OTP, OAuth, and passkey authentication.
 * This is a simplified authentication client that provides methods for different authentication types.
 *
 * @example
 * ```ts
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
 * const signer = await authClient.submitOtpCode({ otpCode: "123456" });
 * ```
 */
export class AuthClient {
  // TODO: temporary for testing before the transport is ready.
  private readonly apiKey: string;
  private readonly createTekStamper: CreateTekStamperFn;
  private readonly createWebAuthnStamper: CreateWebAuthnStamperFn;
  private readonly handleOauthFlow: HandleOauthFlowFn;

  /**
   * Creates a new AuthClient instance
   *
   * @param {AuthClientParams} params - Configuration parameters for the auth client
   * @param {string} params.apiKey - API key for authentication with Alchemy services
   * @param {CreateTekStamperFn} params.createTekStamper - Function to create a TEK stamper
   * @param {CreateWebAuthnStamperFn} params.createWebAuthnStamper - Function to create a WebAuthn stamper
   * @param {HandleOauthFlowFn} params.handleOauthFlow - Function to handle OAuth authentication flow
   */
  constructor(params: AuthClientParams) {
    this.apiKey = params.apiKey;
    this.createTekStamper = params.createTekStamper;
    this.createWebAuthnStamper = params.createWebAuthnStamper;
    this.handleOauthFlow = params.handleOauthFlow;
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
   * ```ts
   * await authClient.sendEmailOtp({ email: "user@example.com" });
   * // User will receive an OTP code via email
   * ```
   */
  public async sendEmailOtp({ email }: SendEmailOtpParams): Promise<void> {
    const { targetPublicKey } = await this.getTekStamper();
    const { otpId, orgId } = await this.dev_request("auth", {
      email,
      emailMode: "otp",
      targetPublicKey,
    });
    this.pendingOtp = { otpId, orgId };
  }

  /**
   * Submits an OTP code for verification and completes the authentication process.
   * This method should be called after sendEmailOtp() with the code received via email.
   *
   * @param {SubmitOtpCodeParams} params - Parameters for submitting the OTP code
   * @param {string} params.otpCode - The OTP code received via email
   * @returns {Promise<Signer>} Promise that resolves to an authenticated Signer instance
   * @throws {Error} If no OTP has been sent or if the code is invalid
   *
   * @example
   * ```ts
   * // First send OTP
   * await authClient.sendEmailOtp({ email: "user@example.com" });
   *
   * // Then submit the code received via email
   * const signer = await authClient.submitOtpCode({ otpCode: "123456" });
   * ```
   */
  public async submitOtpCode({
    otpCode,
  }: SubmitOtpCodeParams): Promise<Signer> {
    if (!this.pendingOtp) {
      throw new Error("Cannot submit OTP code when none has been sent");
    }
    const { otpId, orgId } = this.pendingOtp;
    const { targetPublicKey } = await this.getTekStamper();
    const { credentialBundle } = await this.dev_request("otp", {
      otpId,
      otpCode,
      orgId,
      targetPublicKey,
    });
    this.pendingOtp = null;
    return this.completeAuthWithBundle({ bundle: credentialBundle, orgId });
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
   * @returns {Promise<Signer>} Promise that resolves to an authenticated Signer instance
   * @throws {Error} If OAuth flow fails or is cancelled
   *
   * @example
   * ```ts
   * const signer = await authClient.loginWithOauth({
   *   type: "oauth",
   *   authProviderId: "google",
   *   mode: "popup"
   * });
   * ```
   */
  public async loginWithOauth(params: LoginWithOauthParams): Promise<Signer> {
    const { targetPublicKey } = await this.getTekStamper();
    const oauthConfig = await this.dev_request("prepare-oauth", {
      nonce: getOauthNonce(targetPublicKey),
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
      });
    } else if (response.status === "ACCOUNT_LINKING_CONFIRMATION_REQUIRED") {
      // TODO: decide what to do here.
      throw new Error("Account linking confirmation required");
    } else {
      throw new Error(`Unknown OAuth flow response: ${response.status}`);
    }
  }

  /**
   * Initiates passkey (WebAuthn) authentication flow.
   * This method uses WebAuthn standards to authenticate users with biometric or hardware security keys.
   *
   * @returns {Promise<Signer>} Promise that resolves to an authenticated Signer instance
   * @throws {Error} Currently throws "Not implemented" as this method is under development
   *
   * @example
   * ```ts
   * const signer = await authClient.loginWithPasskey();
   * ```
   */
  public async loginWithPasskey(): Promise<Signer> {
    // TODO: figure out what the current passkey code is doing.
    const stamper = await this.createWebAuthnStamper({
      credentialId: undefined,
    });
    return notImplemented(stamper);
  }

  // TODO: ... and many more.

  private async completeAuthWithBundle({
    bundle,
    orgId,
    idToken,
  }: {
    bundle: string;
    orgId: string;
    idToken?: string;
  }): Promise<Signer> {
    const { stamper } = await this.getTekStamper();
    const success = await stamper.injectCredentialBundle(bundle);
    if (!success) {
      throw new Error("Failed to inject credential bundle");
    }
    const signer = await Signer.create({
      apiKey: this.apiKey,
      stamper,
      orgId,
      idToken,
    });
    // Forget the reference to the TEK stamper, because in some implementations
    // it may become invalid if it is disconnected later. Future logins should
    // use a new stamper.
    this.tekStamperPromise = null;
    return signer;
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

  // TODO: remove this and use transport instead once it's ready.
  private dev_request(path: string, body: unknown): Promise<any> {
    return dev_request(this.apiKey, path, body);
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
