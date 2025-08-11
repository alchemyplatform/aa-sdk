import { Signer } from "./signer.js";
import type {
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  TurnkeyTekStamper,
  OauthConfig,
  GetOauthProviderUrlArgs,
  OauthParams,
} from "./types.js";
import { dev_request } from "./devRequest.js";
import { getOauthProviderUrl } from "./utils.js";
import { sha256 } from "viem";

type TekStamperAndPublicKey = {
  stamper: TurnkeyTekStamper;
  targetPublicKey: string;
};

export type AuthClientParams = {
  // TODO: put this back when the transport is ready.
  // transport: AlchemyTransport;
  // TODO: this is temporary for testing before the transport is ready.
  apiKey: string;
  createTekStamper: CreateTekStamperFn;
  createWebAuthnStamper: CreateWebAuthnStamperFn;
  handleOauthFlow: HandleOauthFlowFn;
};

export type SendEmailOtpParams = {
  email: string;
};

export type SubmitOtpCodeParams = {
  otpCode: string;
};

export type LoginWithOauthParams = {
  type: "oauth";
  authProviderId: string;
  isCustomProvider?: boolean;
  auth0Connection?: string;
  scope?: string;
  claims?: string;
  otherParameters?: Record<string, string>;
  mode?: "popup" | "redirect";
};

type PendingOtp = {
  otpId: string;
  orgId: string;
};

/**
 * Client used to initiate authentication flow
 */
export class AuthClient {
  // TODO: temporary for testing before the transport is ready.
  private readonly apiKey: string;
  private readonly createTekStamper: CreateTekStamperFn;
  private readonly createWebAuthnStamper: CreateWebAuthnStamperFn;
  private readonly handleOauthFlow: HandleOauthFlowFn;

  // Cache for OAuth configuration
  private oauthConfigPromise: Promise<OauthConfig> | null = null;

  /**
   * Creates a new AuthClient instance for handling authentication flows.
   *
   * @param {AuthClientParams} params - Configuration parameters for the AuthClient
   */
  constructor(params: AuthClientParams) {
    this.apiKey = params.apiKey;
    this.createTekStamper = params.createTekStamper;
    this.createWebAuthnStamper = params.createWebAuthnStamper;
    this.handleOauthFlow = params.handleOauthFlow;
  }

  private tekStamperPromise: Promise<TekStamperAndPublicKey> | null = null;
  // TODO: do we care about persisting this across reloads?
  private otpId: string | null = null;

  // TODO: do we care about persisting this across reloads?
  private pendingOtp: PendingOtp | null = null;

  /**
   * Sends an email OTP (One-Time Password) to the specified email address.
   *
   * @param {SendEmailOtpParams} params - Parameters containing the email address
   * @returns {Promise<void>} A promise that resolves when the OTP has been sent
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
   * Submits the OTP code received via email to complete the authentication process.
   *
   * @param {SubmitOtpCodeParams} params - Parameters containing the OTP code
   * @returns {Promise<Signer>} A promise that resolves to an authenticated Signer instance
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
   * Authenticates the user using OAuth with the specified provider.
   *
   * @param {LoginWithOauthParams} params - OAuth authentication parameters
   * @returns {Promise<Signer>} A promise that resolves to an authenticated Signer instance
   */
  public async loginWithOauth(params: LoginWithOauthParams): Promise<Signer> {
    const { targetPublicKey } = await this.getTekStamper();
    const oauthConfig = await this.getOauthConfig(targetPublicKey);

    // Convert LoginWithOauthParams to OauthParams format
    // Need to construct properly typed OauthParams based on the constraints
    let oauthParams: OauthParams = {
      type: "oauth",
      authProviderId: params.authProviderId as any, // TODO: improve this typing
      isCustomProvider: false,
      scope: params.scope,
      claims: params.claims,
      otherParameters: params.otherParameters,
      mode: "popup",
      expirationSeconds: undefined,
    };

    const getOauthProviderUrlArgs: GetOauthProviderUrlArgs = {
      oauthParams,
      turnkeyPublicKey: targetPublicKey,
      oauthCallbackUrl: "https://api.g.alchemy.com/signer/v1/oauth/callback", // TODO: make this configurable
      oauthConfig,
      usesRelativeUrl: false,
    };

    const authUrl = await getOauthProviderUrl(getOauthProviderUrlArgs);
    console.log({ authUrl });
    const response = await this.handleOauthFlow(authUrl);
    console.log({ response });

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
   * Authenticates the user using a passkey (WebAuthn).
   *
   * @returns {Promise<Signer>} A promise that resolves to an authenticated Signer instance
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

  /**
   * Retrieves OAuth configuration by generating a nonce from the Turnkey public key
   * and calling the prepare-oauth endpoint
   *
   * @param {string} turnkeyPublicKey - The Turnkey public key to generate nonce from
   * @returns {Promise<OauthConfig>} OAuth configuration containing codeChallenge, requestKey, and authProviders
   */
  private async getOauthConfig(turnkeyPublicKey: string): Promise<OauthConfig> {
    if (!this.oauthConfigPromise) {
      this.oauthConfigPromise = (async () => {
        const nonce = this.getOauthNonce(turnkeyPublicKey);
        return this.dev_request("prepare-oauth", { nonce });
      })();
    }
    return this.oauthConfigPromise;
  }

  /**
   * Generates OAuth nonce from Turnkey public key.
   * Turnkey requires the nonce in the id token to be in this format.
   *
   * @param {string} turnkeyPublicKey - The Turnkey public key to hash
   * @returns {string} SHA256 hash of the public key without '0x' prefix
   */
  private getOauthNonce(turnkeyPublicKey: string): string {
    return sha256(new TextEncoder().encode(turnkeyPublicKey)).slice(2);
  }

  // TODO: remove this and use transport instead once it's ready.
  private dev_request(path: string, body: unknown): Promise<any> {
    return dev_request(this.apiKey, path, body);
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
