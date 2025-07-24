import type { AlchemyTransport } from "@alchemy/common";
import { Signer } from "./signer.js";
import type {
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  TurnkeyTekStamper,
} from "./types.js";

type TekStamperAndPublicKey = {
  stamper: TurnkeyTekStamper;
  targetPublicKey: string;
};

export class AuthClient {
  constructor(
    private readonly transport: AlchemyTransport,
    private readonly createTekStamper: CreateTekStamperFn,
    private readonly createWebAuthnStamper: CreateWebAuthnStamperFn
  ) {}

  private tekStamperPromise: Promise<TekStamperAndPublicKey> | null = null;

  public async sendAuthEmail(email: string): Promise<void> {
    const { targetPublicKey } = await this.getTekStamper();
    const otpId = await notImplemented(email, targetPublicKey);
    // TODO: store the otpId in the session manager.
    notImplemented(otpId);
  }

  public async submitOtpCode(otpCode: string): Promise<Signer> {
    // TODO: load the otpId from the session manager.
    const otpId = await notImplemented();
    const { bundle, orgId } = await notImplemented(otpId, otpCode);
    return this.completeAuthWithBundle({ bundle, orgId });
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
