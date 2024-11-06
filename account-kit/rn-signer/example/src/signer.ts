import { NativeTEKStamper } from "@account-kit/react-native-signer";
import {
  BaseSignerClient,
  type AlchemySignerClientEvents,
  type AuthenticatingEventMetadata,
  type CreateAccountParams,
  type EmailAuthParams,
  type GetWebAuthnAttestationResult,
  type OauthConfig,
  type OauthParams,
  type SignupResponse,
  type User,
} from "@account-kit/signer";
import Config from "react-native-config";

// TODO: move this out of here
// TODO: need to emit events
export class SignerClient extends BaseSignerClient<undefined> {
  private stamper = NativeTEKStamper;
  constructor() {
    super({
      stamper: NativeTEKStamper,
      connection: { apiKey: Config.API_KEY! },
    });
  }

  createAccount(params: CreateAccountParams): Promise<SignupResponse> {
    throw new Error("Method not implemented.");
  }

  async initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string }> {
    let targetPublicKey = await this.stamper.init();

    console.log(params, targetPublicKey);
    return this.request("/v1/auth", {
      email: params.email,
      targetPublicKey,
    });
  }

  async completeAuthWithBundle(params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User> {
    if (params.authenticatingType !== "email") {
      throw new Error("Unsupported authenticating type");
    }

    await this.stamper.init();

    const result = await this.stamper.injectCredentialBundle(params.bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(params.orgId, params.idToken);

    return user;
  }
  oauthWithRedirect(
    args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<never> {
    throw new Error("Method not implemented.");
  }
  oauthWithPopup(args: Extract<OauthParams, { mode: "popup" }>): Promise<User> {
    throw new Error("Method not implemented.");
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  exportWallet(params: unknown): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  lookupUserWithPasskey(user?: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  protected getOauthConfig(): Promise<OauthConfig> {
    throw new Error("Method not implemented.");
  }
  protected getWebAuthnAttestation(
    options: CredentialCreationOptions,
    userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("Method not implemented.");
  }
}
