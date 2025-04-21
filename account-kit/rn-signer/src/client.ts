import "./utils/buffer-polyfill.js";
import "./utils/mmkv-localstorage-polyfill.js";

/* eslint-disable import/extensions */
import { type ConnectionConfig } from "@aa-sdk/core";
import {
  BaseSignerClient,
  OauthFailedError,
  MfaRequiredError,
  type AlchemySignerClientEvents,
  type AuthenticatingEventMetadata,
  type CreateAccountParams,
  type EmailAuthParams,
  type GetWebAuthnAttestationResult,
  type MfaFactor,
  type OauthConfig,
  type OauthParams,
  type OtpParams,
  type SignupResponse,
  type User,
  type SubmitOtpCodeResponse,
} from "@account-kit/signer";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { z } from "zod";
import { InAppBrowserUnavailableError } from "./errors";
import NativeTEKStamper from "./NativeTEKStamper.js";
import { parseSearchParams } from "./utils/parseUrlParams";
import { parseMfaError } from "./utils/parseMfaError";

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

    if ("credentialBundle" in response && response.credentialBundle) {
      return {
        mfaRequired: false,
        bundle: response.credentialBundle,
      };
    }

    // If the server says "MFA_REQUIRED", pass that data back to the caller:
    if (
      response.status === "MFA_REQUIRED" &&
      response.encryptedPayload &&
      response.multiFactors
    ) {
      return {
        mfaRequired: true,
        encryptedPayload: response.encryptedPayload,
        multiFactors: response.multiFactors,
      };
    }

    // Otherwise, it's truly an error:
    throw new Error(
      "Failed to submit OTP code. Server did not return required fields."
    );
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
  ): Promise<{ orgId: string; otpId?: string; multiFactors?: MfaFactor[] }> {
    this.eventEmitter.emit("authenticating", { type: "email" });
    const targetPublicKey = await this.stamper.init();

    try {
      return await this.request("/v1/auth", {
        email: params.email,
        emailMode: params.emailMode,
        targetPublicKey,
        multiFactors: params.multiFactors,
      });
    } catch (error) {
      const multiFactors = parseMfaError(error);

      // If MFA is required, and emailMode is Magic Link, the user must submit mfa with the request or
      // the server will return an error with the required mfa factors.
      if (multiFactors) {
        throw new MfaRequiredError(multiFactors);
      }
      throw error;
    }
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
}
