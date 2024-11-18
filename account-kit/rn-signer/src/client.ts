/* eslint-disable import/extensions */
import "./utils/mmkv-localstorage-polyfill";
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
import { z } from "zod";

export const RNSignerClientParamsSchema = z.object({
  connection: z.custom<ConnectionConfig>(),
  rootOrgId: z.string().optional(),
});

export type RNSignerClientParams = z.input<typeof RNSignerClientParamsSchema>;

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

  override async createAccount(
    params: CreateAccountParams
  ): Promise<SignupResponse> {
    if (params.type !== "email") {
      throw new Error("Only email account creation is supported");
    }

    this.eventEmitter.emit("authenticating", { type: "email" });
    const { email, expirationSeconds } = params;
    const publicKey = await this.stamper.init();

    const response = await this.request("/v1/signup", {
      email,
      targetPublicKey: publicKey,
      expirationSeconds,
      redirectParams: params.redirectParams?.toString(),
    });

    return response;
  }

  override async initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string }> {
    this.eventEmitter.emit("authenticating", { type: "email" });
    let targetPublicKey = await this.stamper.init();

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

    this.eventEmitter.emit("authenticating", { type: "email" });
    await this.stamper.init();

    const result = await this.stamper.injectCredentialBundle(params.bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(params.orgId, params.idToken);

    this.eventEmitter.emit(params.connectedEventName, user, params.bundle);
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

  override async disconnect(): Promise<void> {
    this.user = undefined;
    this.stamper.clear();
    await this.stamper.init();
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
