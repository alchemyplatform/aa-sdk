import { Signer } from "./signer.js";
import type {
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  TurnkeyTekStamper,
  AuthSessionState,
} from "./types.js";
import { dev_request } from "./devRequest.js";

/**
 * Configuration parameters for creating an AuthClient instance.
 */
export type AuthClientParams = {
  // TODO: put this back when the transport is ready.
  // transport: AlchemyTransport;
  // TODO: this is temporary for testing before the transport is ready.
  /** The API key for authentication with Alchemy services */
  apiKey: string;
  /** Function to create a TEK (Turnkey Embedded Key) stamper */
  createTekStamper: CreateTekStamperFn;
  /** Function to create a WebAuthn stamper for passkey authentication */
  createWebAuthnStamper: CreateWebAuthnStamperFn;
  /** Function to handle OAuth authentication flows */
  handleOauthFlow: HandleOauthFlowFn;
};

/**
 * Parameters for sending an OTP code via email.
 */
export type SendEmailOtpParams = {
  /** The email address to send the OTP code to */
  email: string;
};

/**
 * Parameters for submitting an OTP code for verification.
 */
export type SubmitOtpCodeParams = {
  /** The OTP code received via email */
  otpCode: string;
};

/**
 * Parameters for OAuth authentication.
 */
export type LoginWithOauthParams = {
  /** The type of authentication, always "oauth" */
  type: "oauth";
  /** The ID of the OAuth provider (e.g., "google", "discord") */
  authProviderId: string;
  /** Optional OAuth scope parameter */
  scope?: string;
  /** Optional OAuth claims parameter */
  claims?: string;
  /** Additional OAuth parameters */
  otherParameters?: Record<string, string>;
  /** OAuth flow mode - either popup or redirect */
  mode?: "popup" | "redirect";
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
 * Client for handling various authentication methods including email OTP, OAuth, and passkey authentication.
 * Provides methods to authenticate users and manage authentication sessions.
 *
 * @example
 * ```ts
 * const authClient = new AuthClient({
 *   apiKey: "your-api-key",
 *   createTekStamper: () => createTekStamper(),
 *   createWebAuthnStamper: (options) => createWebAuthnStamper(options),
 *   handleOauthFlow: (url) => handleOauthFlow(url)
 * });
 *
 * // Send OTP via email
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
   * Creates a new AuthClient instance.
   *
   * @param {AuthClientParams} params - Configuration parameters for the auth client
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
   * Sends an OTP code to the specified email address.
   *
   * @param {SendEmailOtpParams} params - The parameters for sending the OTP
   * @param {string} params.email - The email address to send the OTP to
   * @returns {Promise<void>} A promise that resolves when the OTP is sent
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
   * Submits the OTP code received via email to complete authentication.
   *
   * @param {SubmitOtpCodeParams} params - The parameters for submitting the OTP
   * @param {string} params.otpCode - The OTP code received via email
   * @returns {Promise<Signer>} A promise that resolves to a Signer instance upon successful authentication
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
   * Authenticates a user using OAuth provider.
   *
   * @param {LoginWithOauthParams} params - The OAuth authentication parameters
   * @returns {Promise<Signer>} A promise that resolves to a Signer instance upon successful authentication
   */
  public async loginWithOauth(params: LoginWithOauthParams): Promise<Signer> {
    const authUrl = await notImplemented(params);
    const response = await this.handleOauthFlow(authUrl);
    if (response.status === "SUCCESS") {
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
   * Authenticates a user using a passkey.
   *
   * @returns {Promise<Signer>} A promise that resolves to a Signer instance upon successful authentication
   */
  public async loginWithPasskey(): Promise<Signer> {
    // TODO: figure out what the current passkey code is doing.
    const stamper = await this.createWebAuthnStamper({
      credentialId: undefined,
    });
    return notImplemented(stamper);
  }

  /**
   * Loads a signer from a previously saved authentication session state.
   *
   * @param {AuthSessionState} state - The saved authentication session state
   * @returns {Promise<Signer | undefined>} A promise that resolves to a Signer instance if the session is valid, undefined otherwise
   */
  public async loadAuthSessionState(
    state: AuthSessionState,
  ): Promise<Signer | undefined> {
    const { type, expirationDateMs, user } = state;
    if (expirationDateMs > Date.now()) {
      if (type === "passkey") {
        return this.loginWithPasskey();
      } else {
        const { bundle } = state;
        const { orgId, idToken } = user;
        return this.completeAuthWithBundle({ bundle, orgId, idToken });
      }
    }
    return undefined;
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
