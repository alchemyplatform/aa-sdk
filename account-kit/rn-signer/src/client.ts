/* eslint-disable import/extensions */
import { type ConnectionConfig } from "@aa-sdk/core";
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
import NativeTEKStamper from "./NativeTEKStamper";

export type RNSignerClientParams = {
  connection: ConnectionConfig;
  rootOrgId?: string;
};

// TODO: need to emit events
export class RNSignerClient extends BaseSignerClient<undefined> {
  private stamper = NativeTEKStamper;
  constructor(params: RNSignerClientParams) {
    super({
      stamper: NativeTEKStamper,
      rootOrgId: "24c1acf5-810f-41e0-a503-d5d13fa8e830",
      ...params,
    });
  }

  override createAccount(
    _params: CreateAccountParams
  ): Promise<SignupResponse> {
    throw new Error("Method not implemented.");
  }

  override async initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string }> {
    let targetPublicKey = await this.stamper.init();

    console.log(params, targetPublicKey);
    return this.request("/v1/auth", {
      email: params.email,
      targetPublicKey,
    });
  }

  override async completeAuthWithBundle(params: {
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
  override oauthWithRedirect(
    _args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<never> {
    throw new Error("Method not implemented.");
  }
  override oauthWithPopup(
    _args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User> {
    throw new Error("Method not implemented.");
  }
  override disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  override exportWallet(_params: unknown): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  override lookupUserWithPasskey(_user?: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  protected override getOauthConfig(): Promise<OauthConfig> {
    throw new Error("Method not implemented.");
  }
  protected override getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("Method not implemented.");
  }
}
