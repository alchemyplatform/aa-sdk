import "./utils/buffer-polyfill.js";
import "./utils/mmkv-localstorage-polyfill.js";

/* eslint-disable import/extensions */
import { type ConnectionConfig } from "@aa-sdk/core";
import {
  BaseSignerClient,
  OauthFailedError,
  type AlchemySignerClientEvents,
  type AuthenticatingEventMetadata,
  type CreateAccountParams,
  type RemoveMfaParams,
  type EmailAuthParams,
  type EnableMfaParams,
  type EnableMfaResult,
  type GetWebAuthnAttestationResult,
  type MfaFactor,
  type OauthConfig,
  type OauthParams,
  type OtpParams,
  type SignupResponse,
  type User,
  type VerifyMfaParams,
  type SubmitOtpCodeResponse,
} from "@account-kit/signer";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { z } from "zod";
import { InAppBrowserUnavailableError } from "./errors";
import NativeTEKStamper from "./NativeTEKStamper.js";
import { parseSearchParams } from "./utils/parseUrlParams";

export const RNSignerClientParamsSchema = z.object({
  connection: z.custom<ConnectionConfig>(),
  rootOrgId: z.string().optional(),
  oauthCallbackUrl: z
    .string()
    .optional()
    .default("https://signer.alchemy.com/callback"),
});

export type RNSignerClientParams = z.input<typeof RNSignerClientParamsSchema>;

// TODO: need to emit events
export class RNSignerClient extends BaseSignerClient<undefined> {
  private stamper = NativeTEKStamper;
  oauthCallbackUrl: string;
  private validAuthenticatingTypes: AuthenticatingEventMetadata["type"][] = [
    "email",
    "otp",
    "oauth",
  ];

  constructor(params: RNSignerClientParams) {
    const { connection, rootOrgId, oauthCallbackUrl } =
      RNSignerClientParamsSchema.parse(params);

    super({
      stamper: NativeTEKStamper,
      rootOrgId: rootOrgId ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830",
      connection,
    });

    this.oauthCallbackUrl = oauthCallbackUrl;
  }

  override async submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">
  ): Promise<SubmitOtpCodeResponse> {
    this.eventEmitter.emit("authenticating", { type: "otpVerify" });
    const publicKey = await this.stamper.init();

    const response = await this.request("/v1/otp", {
      ...args,
      targetPublicKey: publicKey,
    });

    if (response.status === "MFA_REQUIRED") {
      throw new Error("Multi-factor authentication is required");
    }

    return { bundle: response.credentialBundle, mfaRequired: false };
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
      emailMode: params.emailMode,
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

    const response = await this.request("/v1/auth", {
      email: params.email,
      emailMode: params.emailMode,
      targetPublicKey,
    });

    return response;
  }

  override async completeAuthWithBundle(params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User> {
    if (!this.validAuthenticatingTypes.includes(params.authenticatingType)) {
      throw new Error("Unsupported authenticating type");
    }

    this.eventEmitter.emit("authenticating", {
      type: params.authenticatingType,
    });

    await this.stamper.init();

    const result = await this.stamper.injectCredentialBundle(params.bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(params.orgId, params.idToken);

    this.eventEmitter.emit(params.connectedEventName, user, params.bundle);
    return user;
  }
  override oauthWithRedirect = async (
    args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<User> => {
    // Ensure the In-App Browser required for authentication is available
    if (!(await InAppBrowser.isAvailable())) {
      throw new InAppBrowserUnavailableError();
    }

    this.eventEmitter.emit("authenticating", { type: "oauth" });

    const oauthParams = args;
    const turnkeyPublicKey = await this.stamper.init();
    const oauthCallbackUrl = this.oauthCallbackUrl;
    const oauthConfig = await this.getOauthConfig();
    const providerUrl = await this.getOauthProviderUrl({
      oauthParams,
      turnkeyPublicKey,
      oauthCallbackUrl,
      oauthConfig,
      usesRelativeUrl: false,
    });
    const redirectUrl = args.redirectUrl;
    const res = await InAppBrowser.openAuth(providerUrl, redirectUrl);

    if (res.type !== "success" || !res.url) {
      throw new OauthFailedError("An error occured completing your request");
    }

    const authResult = parseSearchParams(res.url);
    const bundle = authResult["alchemy-bundle"] ?? "";
    const orgId = authResult["alchemy-org-id"] ?? "";
    const idToken = authResult["alchemy-id-token"] ?? "";
    const isSignup = authResult["alchemy-is-signup"];
    const error = authResult["alchemy-error"];

    if (error) {
      throw new OauthFailedError(error);
    }

    if (bundle && orgId && idToken) {
      const user = await this.completeAuthWithBundle({
        bundle,
        orgId,
        connectedEventName: "connectedOauth",
        idToken,
        authenticatingType: "oauth",
      });

      if (isSignup) {
        this.eventEmitter.emit("newUserSignup");
      }

      return user;
    }

    // Throw the Alchemy error if available, otherwise throw a generic error.
    throw new OauthFailedError("An error occured completing your request");
  };

  override oauthWithPopup(
    _args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User> {
    throw new Error("Method not implemented");
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

  override targetPublicKey(): Promise<string> {
    return this.stamper.init();
  }

  protected override getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("Method not implemented.");
  }

  protected override getOauthConfig = async (): Promise<OauthConfig> => {
    const publicKey = await this.stamper.init();

    const nonce = this.getOauthNonce(publicKey);
    return this.request("/v1/prepare-oauth", { nonce });
  };

  /**
   * Retrieves the list of MFA factors configured for the current user.
   *
   * @throws {Error} This method is not implemented in RNSignerClient
   */
  public override getMfaFactors(): Promise<{ multiFactors: MfaFactor[] }> {
    throw new Error("getMfaFactors is not implemented in RNSignerClient");
  }

  /**
   * Initiates the setup of a new MFA factor for the current user.
   *
   * @param {EnableMfaParams} _params The parameters required to enable a new MFA factor
   * @throws {Error} This method is not implemented in RNSignerClient
   */
  public override addMfa(_params: EnableMfaParams): Promise<EnableMfaResult> {
    throw new Error("enableMfa is not implemented in RNSignerClient");
  }

  /**
   * Verifies a newly created MFA factor to complete the setup process.
   *
   * @param {VerifyMfaParams} _params The parameters required to verify the MFA factor
   * @throws {Error} This method is not implemented in RNSignerClient
   */
  public override verifyMfa(_params: VerifyMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("verifyMfa is not implemented in RNSignerClient");
  }

  /**
   * Removes existing MFA factors by ID.
   *
   * @param {RemoveMfaParams} _params The parameters specifying which factors to disable
   * @throws {Error} This method is not implemented in RNSignerClient
   */
  public override removeMfa(_params: RemoveMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("disableMfa is not implemented in RNSignerClient");
  }

  public override validateMultiFactors(_params: {
    encryptedPayload: string;
    multiFactors: { multiFactorId: string; multiFactorCode: string }[];
  }): Promise<{ bundle: string }> {
    throw new Error(
      "validateMultiFactors is not implemented in RNSignerClient"
    );
  }
}
