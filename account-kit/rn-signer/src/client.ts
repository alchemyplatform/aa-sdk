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
  type RemoveMfaParams,
  type EmailAuthParams,
  type EnableMfaParams,
  type EnableMfaResult,
  type ValidateMultiFactorsParams,
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
import { parseMfaError } from "./utils/parseMfaError";

const MFA_PAYLOAD = {
  GET: "get_mfa",
  ADD: "add_mfa",
  DELETE: "delete_mfas",
  VERIFY: "verify_mfa",
  LIST: "list_mfas",
};

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

  /**
   * Retrieves the list of MFA factors configured for the current user.
   *
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to an array of configured MFA factors
   * @throws {Error} If no user is authenticated
   */
  public override getMfaFactors = async (): Promise<{
    multiFactors: MfaFactor[];
  }> => {
    if (!this.user) {
      throw new Error("Not authenticated");
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
        payload: MFA_PAYLOAD.LIST,
        signWith: this.user.address,
      },
    });

    return this.request("/v1/auth-list-multi-factors", {
      stampedRequest,
    });
  };

  /**
   * Initiates the setup of a new MFA factor for the current user.
   *
   * @param {EnableMfaParams} params The parameters required to enable a new MFA factor
   * @returns {Promise<EnableMfaResult>} A promise that resolves to the factor setup information
   * @throws {Error} If no user is authenticated or if an unsupported factor type is provided
   */
  public override addMfa = async (
    params: EnableMfaParams
  ): Promise<EnableMfaResult> => {
    if (!this.user) {
      throw new Error("Not authenticated");
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
        payload: MFA_PAYLOAD.ADD,
        signWith: this.user.address,
      },
    });

    switch (params.multiFactorType) {
      case "totp":
        return this.request("/v1/auth-request-multi-factor", {
          stampedRequest,
          multiFactorType: params.multiFactorType,
        });
      default:
        throw new Error(
          `Unsupported MFA factor type: ${params.multiFactorType}`
        );
    }
  };

  /**
   * Verifies a newly created MFA factor to complete the setup process.
   *
   * @param {VerifyMfaParams} params The parameters required to verify the MFA factor
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to the updated list of MFA factors
   * @throws {Error} If no user is authenticated
   */
  public override verifyMfa = async (
    params: VerifyMfaParams
  ): Promise<{ multiFactors: MfaFactor[] }> => {
    if (!this.user) {
      throw new Error("Not authenticated");
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
        payload: MFA_PAYLOAD.VERIFY,
        signWith: this.user.address,
      },
    });

    return this.request("/v1/auth-verify-multi-factor", {
      stampedRequest,
      multiFactorId: params.multiFactorId,
      multiFactorCode: params.multiFactorCode,
    });
  };

  /**
   * Removes existing MFA factors by ID.
   *
   * @param {RemoveMfaParams} params The parameters specifying which factors to disable
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to the updated list of MFA factors
   * @throws {Error} If no user is authenticated
   */
  public override removeMfa = async (
    params: RemoveMfaParams
  ): Promise<{ multiFactors: MfaFactor[] }> => {
    if (!this.user) {
      throw new Error("Not authenticated");
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
        payload: MFA_PAYLOAD.DELETE,
        signWith: this.user.address,
      },
    });

    return this.request("/v1/auth-delete-multi-factors", {
      stampedRequest,
      multiFactorIds: params.multiFactorIds,
    });
  };

  /**
   * Validates multiple MFA factors using the provided encrypted payload and MFA codes.
   *
   * @param {ValidateMultiFactorsParams} params The validation parameters
   * @returns {Promise<{ bundle: string }>} A promise that resolves to an object containing the credential bundle
   * @throws {Error} If no credential bundle is returned from the server
   */
  public override validateMultiFactors = async (
    params: ValidateMultiFactorsParams
  ): Promise<{ bundle: string }> => {
    // Send the encryptedPayload plus TOTP codes
    const response = await this.request("/v1/auth-validate-multi-factors", {
      encryptedPayload: params.encryptedPayload,
      multiFactors: params.multiFactors,
    });

    // The server is expected to return the *decrypted* payload in `response.payload.credentialBundle`
    if (!response.payload || !response.payload.credentialBundle) {
      throw new Error(
        "Request to validateMultiFactors did not return a credential bundle"
      );
    }

    return {
      bundle: response.payload.credentialBundle,
    };
  };
}
