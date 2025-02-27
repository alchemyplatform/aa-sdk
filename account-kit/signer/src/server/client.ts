import { HexSchema } from "@aa-sdk/core";
import { p256 } from "@noble/curves/p256";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { decryptCredentialBundle, generateP256KeyPair } from "@turnkey/crypto";
import { fromBytes, toHex, type Hex } from "viem";
import type { z } from "zod";
import { BaseSignerClient } from "../client/base.js";
import { AlchemySignerClientParamsSchema } from "../client/index.js";
import type {
  AlchemySignerClientEvents,
  AuthenticatingEventMetadata,
  CreateAccountParams,
  EmailAuthParams,
  GetWebAuthnAttestationResult,
  OauthConfig,
  OauthParams,
  OtpParams,
  SignupResponse,
  User,
} from "../client/types.js";

export const AlchemyServerSignerClientParamsSchema =
  AlchemySignerClientParamsSchema.omit({
    iframeConfig: true,
    rpId: true,
  }).extend({
    // this private key is used to decrypt bundles (must be p256 curve key)
    privateKey: HexSchema,
  });

export type AlchemyServerSignerClientParams = z.input<
  typeof AlchemyServerSignerClientParamsSchema
>;

export class AlchemyServerSignerClient extends BaseSignerClient {
  oauthCallbackUrl: string;
  private privateKey: Hex;
  targetPublicKey: string;

  constructor(params: AlchemyServerSignerClientParams) {
    const { connection, rootOrgId, oauthCallbackUrl, privateKey } =
      AlchemyServerSignerClientParamsSchema.parse(params);
    super({
      connection,
      rootOrgId,
      // @ts-expect-error TODO: need to lazy init this somehow
      stamper: null,
    });

    this.oauthCallbackUrl = oauthCallbackUrl;
    this.privateKey = privateKey;
    this.targetPublicKey = fromBytes(
      p256.getPublicKey(this.privateKey),
      "hex"
    ).slice(2);
  }

  public async createAccount(
    params: CreateAccountParams
  ): Promise<SignupResponse> {
    if (params.type === "email") {
      this.eventEmitter.emit("authenticating", { type: "otp" });
      const { email, emailMode, expirationSeconds } = params;
      const publicKey = this.targetPublicKey;

      const response = await this.request("/v1/signup", {
        email,
        emailMode,
        targetPublicKey: publicKey,
        expirationSeconds,
        redirectParams: params.redirectParams?.toString(),
      });

      return response;
    }

    throw new Error(
      "createAccount only works for email, use oauth methods for oauth signup/login"
    );
  }

  public initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string; otpId?: string }> {
    this.eventEmitter.emit("authenticating", { type: "otp" });
    const { email, emailMode, expirationSeconds } = params;
    const publicKey = this.targetPublicKey;

    return this.request("/v1/auth", {
      email,
      emailMode,
      targetPublicKey: publicKey,
      expirationSeconds,
      redirectParams: params.redirectParams?.toString(),
    });
  }

  public async completeAuthWithBundle({
    bundle,
    orgId,
    connectedEventName,
    idToken,
    authenticatingType,
  }: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User> {
    this.eventEmitter.emit("authenticating", { type: authenticatingType });
    const decryptedApiKey = decryptCredentialBundle(bundle, this.privateKey);
    if (!decryptedApiKey) {
      throw new Error("Unable to decrypt the credential bundle");
    }

    const publicKey = p256.getPublicKey(decryptedApiKey);
    this.setStamper(
      new ApiKeyStamper({
        apiPrivateKey: decryptedApiKey,
        apiPublicKey: fromBytes(publicKey, "hex"),
      })
    );

    const user = await this.whoami(orgId, idToken);

    this.eventEmitter.emit(connectedEventName, user, bundle);

    return user;
  }

  // TODO: oauth on the server requires a bit more work
  // you basically need to return the provider URL to the client including the target public key of the client
  // and then injecting the credential bundle back into this client
  public async oauthWithRedirect(
    args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<User | never> {
    const providerUrl = await this.getOauthProviderUrl({
      oauthParams: args,
      turnkeyPublicKey: this.targetPublicKey,
      oauthCallbackUrl: this.oauthCallbackUrl,
    });

    throw new OAuthRedirectError(providerUrl);
  }

  public async oauthWithPopup(
    args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User> {
    const providerUrl = await this.getOauthProviderUrl({
      oauthParams: args,
      turnkeyPublicKey: this.targetPublicKey,
      oauthCallbackUrl: this.oauthCallbackUrl,
    });

    throw new OAuthRedirectError(providerUrl);
  }

  public async submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">
  ): Promise<{ bundle: string }> {
    this.eventEmitter.emit("authenticating", { type: "otpVerify" });
    const targetPublicKey = this.targetPublicKey;
    const { credentialBundle } = await this.request("/v1/otp", {
      ...args,
      targetPublicKey,
    });
    return { bundle: credentialBundle };
  }

  public async disconnect(): Promise<void> {
    // @ts-expect-error TODO: need to support clearing out the client stamper
    this.setStamper(null);
  }

  // potentially possible on the server but needs to be thought out more
  public exportWallet(_params: unknown): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  // not possible on the server
  public lookupUserWithPasskey(_user?: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  protected getOauthConfig(): Promise<OauthConfig> {
    const nonce = this.getOauthNonce(this.targetPublicKey);
    return this.request("/v1/prepare-oauth", { nonce });
  }

  // Not possible on the server
  protected async getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("Method not implemented.");
  }
}

export class OAuthRedirectError extends Error {
  constructor(public oauthProviderUrl: string) {
    super(
      [
        'Complete login on the client using this URL. and then call client.completeAuthWithBundle({ bundle, orgId, idToken, connectedEventName: "connected", authenticatingType: "oauth" }).',
        "The paramters for bundle, orgId, idToken will be returned to your client from the completed auth flow.",
      ].join("\n")
    );
  }
}

// Examples
const example = new AlchemyServerSignerClient({
  connection: {
    apiKey: "alchemy-api-key",
  },
  // This would be persisted somewhere on the server
  // you probably want a different key per user or you can have a global key
  // doesn't matter much because you're a custodian of these accounts anyways now
  privateKey: toHex(generateP256KeyPair().privateKey),
});

// email signup / login
// @ts-expect-error ignore this await issue it's an example
const user = await example.lookupUserByEmail("user@email.com");
if (user) {
  // OTPId is returned when using otp auth, you will need it to complete OTP auth
  // @ts-expect-error ignore this await issue it's an example
  const { orgId, otpId } = await example.initEmailAuth({
    email: "user@email.com",
  });
} else {
  // @ts-expect-error ignore this await issue it's an example
  const { orgId, otpId } = await example.createAccount({
    type: "email",
    email: "user@email.com",
  });
}

// return the orgId and otpId to the client and then call an endpoint to complete auth with:
// for magic link
example.completeAuthWithBundle({
  authenticatingType: "email",
  bundle: "from-client",
  orgId: "from-client",
  connectedEventName: "connected",
});

// for otp
// @ts-expect-error ignore this await issue it's an example
const { bundle } = await example.submitOtpCode({
  otpCode: "123456",
  otpId: "from-client",
  orgId: "from-client",
});
example.completeAuthWithBundle({
  authenticatingType: "otpVerify",
  bundle,
  orgId: "from-client",
  connectedEventName: "connected",
});

// oauth login / signup
example
  .oauthWithRedirect({
    authProviderId: "google",
    type: "oauth",
    mode: "redirect",
    redirectUrl: "https://your-domain-url-handling-oauth-callback",
  })
  .catch((e) => {
    if (e instanceof OAuthRedirectError) {
      // send this URL to the client and then open it to complete auth
      return e.oauthProviderUrl;
    }
    throw e;
  });

// complete the auth on the client using the above url and then get the params from the qp and call the endpoint to complete auth
example.completeAuthWithBundle({
  authenticatingType: "oauth",
  bundle: "from-client",
  orgId: "from-client",
  connectedEventName: "connected",
});

// NOTE: on all of the above `completeAuthWithBundle` calls, you'll likely want to do this before any call to `example.signRawMessage` or `example.whoami`
// so that you can get an authenticated instance of the client and ensure you get per request isolation
