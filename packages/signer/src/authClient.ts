import type { AlchemyTransport } from "@alchemy/common";
import { Signer } from "./signer.js";
import type {
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
  TurnkeyTekStamper,
} from "./types.js";

type TekStamperAndPublicKey = {
  stamper: TurnkeyTekStamper;
  targetPublicKey: string;
};

export type AuthClientParams = {
  transport: AlchemyTransport;
  createTekStamper: CreateTekStamperFn;
  createWebAuthnStamper: CreateWebAuthnStamperFn;
  handleOauthFlow: HandleOauthFlowFn;
};

export type LoginWithOauthParams = {
  type: "oauth";
  authProviderId: string;
  scope?: string;
  claims?: string;
  otherParameters?: Record<string, string>;
  mode?: "popup" | "redirect";
};

export class AuthClient {
  private readonly transport: AlchemyTransport;
  private readonly createTekStamper: CreateTekStamperFn;
  private readonly createWebAuthnStamper: CreateWebAuthnStamperFn;
  private readonly handleOauthFlow: HandleOauthFlowFn;

  constructor(params: AuthClientParams) {
    this.transport = params.transport;
    this.createTekStamper = params.createTekStamper;
    this.createWebAuthnStamper = params.createWebAuthnStamper;
    this.handleOauthFlow = params.handleOauthFlow;
  }

  private tekStamperPromise: Promise<TekStamperAndPublicKey> | null = null;
  // TODO: do we care about persisting this across reloads?
  private otpId: string | null = null;

  public async sendEmailOtp(email: string): Promise<void> {
    const { targetPublicKey } = await this.getTekStamper();
    this.otpId = await notImplemented(email, targetPublicKey);
  }

  public async submitOtpCode(otpCode: string): Promise<Signer> {
    const { bundle, orgId } = await notImplemented(this.otpId, otpCode);
    this.otpId = null;
    return this.completeAuthWithBundle({ bundle, orgId });
  }

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
      transport: this.transport,
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
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
