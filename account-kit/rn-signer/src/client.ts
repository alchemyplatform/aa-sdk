/* eslint-disable import/extensions */
import "react-native-get-random-values";
import "./utils/buffer-polyfill";
import "./utils/mmkv-localstorage-polyfill";

/* eslint-disable import/extensions */
import { type ConnectionConfig } from "@aa-sdk/core";
import {
  createPasskey,
  PasskeyStamper,
  type AuthenticatorTransport,
} from "@turnkey/react-native-passkey-stamper";
import {
  stringify as uuidStringify,
  parse as uuidParse,
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";
import {
  BaseSignerClient,
  OauthFailedError,
  MfaRequiredError,
  type AlchemySignerClientEvents,
  type AuthenticatingEventMetadata,
  type EmailAuthParams,
  type GetWebAuthnAttestationResult,
  type MfaFactor,
  type OauthConfig,
  type OauthParams,
  type OtpParams,
  type User,
  type SubmitOtpCodeResponse,
  type CredentialCreationOptionOverrides,
  type SmsAuthParams,
} from "@account-kit/signer";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { z } from "zod";
import { InAppBrowserUnavailableError } from "./errors";
import NativeTEKStamper from "./NativeTEKStamper";
import { parseSearchParams } from "./utils/parseUrlParams";
import { parseMfaError } from "./utils/parseMfaError";

export const RNSignerClientParamsSchema = z.object({
  connection: z.custom<ConnectionConfig>(),
  rootOrgId: z.string().optional(),
  oauthCallbackUrl: z
    .string()
    .optional()
    .default("https://signer.alchemy.com/callback"),
  rpId: z.string().optional(),
});

export type RNSignerClientParams = z.input<typeof RNSignerClientParamsSchema>;

// TODO: need to emit events
export class RNSignerClient extends BaseSignerClient<undefined> {
  private stamper = NativeTEKStamper;
  oauthCallbackUrl: string;
  rpId: string | undefined;
  private validAuthenticatingTypes: AuthenticatingEventMetadata["type"][] = [
    "email",
    "otp",
    "oauth",
  ];

  constructor(params: RNSignerClientParams) {
    const { connection, rootOrgId, oauthCallbackUrl, rpId } =
      RNSignerClientParamsSchema.parse(params);

    super({
      stamper: NativeTEKStamper,
      rootOrgId: rootOrgId ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830",
      connection,
    });

    this.oauthCallbackUrl = oauthCallbackUrl;
    this.rpId = rpId;
  }

  override async submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">,
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
      "Failed to submit OTP code. Server did not return required fields.",
    );
  }

  override async initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">,
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

  override async initSmsAuth(params: Omit<SmsAuthParams, "targetPublicKey">) {
    this.eventEmitter.emit("authenticating", { type: "otp" });
    const { phone } = params;
    const targetPublicKey = await this.stamper.init();

    return this.request("/v1/auth", {
      phone,
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
    args: Extract<OauthParams, { mode: "redirect" }>,
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
    _args: Extract<OauthParams, { mode: "popup" }>,
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

  override targetPublicKey(): Promise<string> {
    return this.stamper.init();
  }

  protected override getWebAuthnAttestation = async (
    options?: CredentialCreationOptionOverrides,
    userDetails: { username: string } = {
      username: this.user?.email ?? "anonymous",
    },
  ): Promise<GetWebAuthnAttestationResult & { rpId: string }> => {
    const { username } = userDetails;
    const authenticatorUserId = getAuthenticatorUserId(options);
    const rpId = this.requireRpId(options);
    const authenticatorParams = await createPasskey({
      rp: {
        id: rpId,
        name: rpId,
        ...options?.publicKey?.rp,
      },
      user: {
        name: username,
        displayName: username,
        ...options?.publicKey?.user,
        id: uuidStringify(bufferSourceToUint8Array(authenticatorUserId)),
      },
      authenticatorName: "End-User Passkey",
    });
    return {
      attestation: authenticatorParams.attestation,
      challenge: authenticatorParams.challenge,
      authenticatorUserId,
      rpId,
    };
  };

  protected override getOauthConfig = async (): Promise<OauthConfig> => {
    const publicKey = await this.stamper.init();

    const nonce = this.getOauthNonce(publicKey);
    return this.request("/v1/prepare-oauth", { nonce });
  };

  protected override async initSessionStamper(): Promise<string> {
    return this.stamper.init();
  }

  protected override async initWebauthnStamper(
    user: User | undefined = this.user,
    options?: CredentialCreationOptionOverrides,
  ): Promise<void> {
    const rpId = this.requireRpId(options);
    this.setStamper(
      new PasskeyStamper({
        rpId,
        allowCredentials: user?.credentialId
          ? [
              {
                id: user.credentialId,
                type: "public-key",
                transports: ["internal", "hybrid"] as AuthenticatorTransport[],
              },
            ]
          : undefined,
      }),
    );
  }

  private requireRpId(options?: CredentialCreationOptionOverrides): string {
    const rpId = options?.publicKey?.rp?.id ?? this.rpId;
    if (!rpId) {
      throw new Error(
        "rpId must be set in configuration to use passkeys in React Native",
      );
    }
    return rpId;
  }
}

function getAuthenticatorUserId(
  options?: CredentialCreationOptionOverrides,
): BufferSource {
  // Android requires this to be a UUIDv4.
  const id = options?.publicKey?.user?.id;
  if (id) {
    const stringId = uuidStringify(id as Uint8Array);
    if (!uuidValidate(stringId) || uuidVersion(stringId) !== 4) {
      throw new Error("Challenge must be a valid UUIDv4 to support Android");
    }
    return id;
  }
  return uuidParse(uuidv4());
}

function bufferSourceToUint8Array(bufferSource: BufferSource): Uint8Array {
  if (bufferSource instanceof Uint8Array) {
    return bufferSource;
  }
  if (bufferSource instanceof ArrayBuffer) {
    return new Uint8Array(bufferSource);
  }
  if (ArrayBuffer.isView(bufferSource)) {
    // Any other TypedArray (e.g., Int16Array, Float32Array, etc.)
    return new Uint8Array(
      bufferSource.buffer,
      bufferSource.byteOffset,
      bufferSource.byteLength,
    );
  }
  throw new TypeError(
    "Input must be a BufferSource (ArrayBuffer or TypedArray)",
  );
}
