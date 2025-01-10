/* eslint-disable import/extensions */
import "./utils/mmkv-localstorage-polyfill";
import "./utils/buffer-polyfill";
import { type ConnectionConfig } from "@aa-sdk/core";
import {
  BaseSignerClient,
  type AlchemySignerClientEvents,
  type AuthenticatingEventMetadata,
  type CreateAccountParams,
  type EmailAuthParams,
  type GetWebAuthnAttestationResult,
  type KnownAuthProvider,
  type OauthConfig,
  type OauthMode,
  type OauthParams,
  type OtpParams,
  type SignupResponse,
  type User,
} from "@account-kit/signer";
import NativeTEKStamper from "./NativeTEKStamper";
import { OAuthProvidersError } from "./errors";
import { z } from "zod";
import { getDefaultScopeAndClaims, getOauthNonce } from "./oauth";
import { base64UrlEncode } from "./utils/base64UrlEncode";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { Alert } from "react-native";

type OauthState = {
  authProviderId: string;
  isCustomProvider?: boolean;
  requestKey: string;
  turnkeyPublicKey: string;
  expirationSeconds?: number;
  redirectUrl?: string;
  openerOrigin?: string;
};

export const RNSignerClientParamsSchema = z.object({
  connection: z.custom<ConnectionConfig>(),
  rootOrgId: z.string().optional(),
  oauthCallbackUrl: z
    .string()
    .optional()
    .default("https://signer.alchemy.com/callback"),
  appScheme: z.string().optional(),
});

export type RNSignerClientParams = z.input<typeof RNSignerClientParamsSchema>;

// TODO: need to emit events
export class RNSignerClient extends BaseSignerClient<undefined> {
  private stamper = NativeTEKStamper;
  oauthCallbackUrl: string;
  appScheme: string;
  private appDeeplink: string;

  constructor(params: RNSignerClientParams) {
    const { connection, rootOrgId, oauthCallbackUrl, appScheme } =
      RNSignerClientParamsSchema.parse(params);

    super({
      stamper: NativeTEKStamper,
      rootOrgId: rootOrgId ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830",
      connection,
    });

    this.appScheme = appScheme ?? "";

    this.appDeeplink = `${this.appScheme}://`;

    this.oauthCallbackUrl = oauthCallbackUrl;
  }

  override async submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">
  ): Promise<{ bundle: string }> {
    this.eventEmitter.emit("authenticating", { type: "otpVerify" });
    const publicKey = await this.stamper.init();

    const { credentialBundle } = await this.request("/v1/otp", {
      ...args,
      targetPublicKey: publicKey,
    });

    return { bundle: credentialBundle };
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
    if (
      params.authenticatingType !== "email" &&
      params.authenticatingType !== "otp"
    ) {
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
  override oauthWithRedirect = async (
    _args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<never> => {
    try {
      const providerUrl = await this.getOauthProviderUrl(_args);

      if (await InAppBrowser.isAvailable()) {
        const res = await InAppBrowser.openAuth(providerUrl, this.appDeeplink);

        Alert.alert(JSON.stringify(res));
      }
      return new Promise((_, reject) =>
        setTimeout(() => reject("Failed to redirect to OAuth provider"), 1000)
      );
    } catch (e) {
      console.error("Error performing OAuth Operation", e);
      throw new Error("Error performing OAuth Operation");
    }
  };
  override oauthWithPopup = async (
    _args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User> => {
    try {
      const providerUrl = await this.getOauthProviderUrl(_args);

      if (await InAppBrowser.isAvailable()) {
        const res = await InAppBrowser.openAuth(providerUrl, this.appDeeplink);

        Alert.alert(JSON.stringify(res));
      }

      return {} as User;
    } catch (e) {
      console.error("Error performing OAuth Operation", e);
      throw new Error("Error performing OAuth Operation");
    }
  };

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

  protected override getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("Method not implemented.");
  }

  private getOauthProviderUrl = async (args: OauthParams): Promise<string> => {
    const {
      authProviderId,
      isCustomProvider,
      auth0Connection,
      scope: providedScope,
      claims: providedClaims,
      expirationSeconds,
      redirectUrl,
      mode,
    } = args;

    const res = await this.getOauthConfigForMode("popup");

    const { codeChallenge, requestKey, authProviders } = res;

    if (!authProviders) {
      throw new OAuthProvidersError();
    }

    const authProvider = authProviders.find(
      (provider) =>
        provider.id === authProviderId &&
        !!provider.isCustomProvider === !!isCustomProvider
    );

    if (!authProvider) {
      throw new Error(`OAuth provider with id ${authProviderId} not found`);
    }

    let scope: string;
    let claims: string | undefined;

    if (providedScope) {
      scope = addOpenIdIfAbsent(providedScope);
      claims = providedClaims;
    } else {
      if (isCustomProvider) {
        throw new Error("scope must be provided for a custom provider");
      }

      const scopeAndClaims = getDefaultScopeAndClaims(
        authProviderId as KnownAuthProvider
      );
      if (!scopeAndClaims) {
        throw new Error(
          `Default scope not known for provider ${authProviderId}`
        );
      }
      ({ scope, claims } = scopeAndClaims);
    }
    const { authEndpoint, clientId } = authProvider;
    const turnkeyPublicKey = await this.stamper.init();
    const nonce = getOauthNonce(turnkeyPublicKey);

    const stateObject: OauthState = {
      authProviderId,
      isCustomProvider,
      requestKey,
      turnkeyPublicKey,
      expirationSeconds,
      redirectUrl: mode === "redirect" ? redirectUrl : undefined, // We only use the 'Popup' mode in RN
      openerOrigin: mode === "popup" ? this.appDeeplink : undefined,
    };

    const state = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(stateObject)).buffer
    );
    const authUrl = new URL(authEndpoint);

    const params: Record<string, string> = {
      redirect_uri: this.oauthCallbackUrl,
      response_type: "code",
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
      client_id: clientId,
      nonce,
    };
    if (claims) {
      params.claims = claims;
    }
    if (auth0Connection) {
      params.connection = auth0Connection;
    }

    Object.keys(params).forEach((param) => {
      params[param] && authUrl.searchParams.append(param, params[param]);
    });

    const [urlPath, searchParams] = authUrl.href.split("?");

    // Ensure to prevent potential trailing backslashes.
    return `${urlPath?.replace(/\/$/, "")}?${searchParams}`;
  };

  protected override getOauthConfig = async (): Promise<OauthConfig> => {
    const currentStamper = this.turnkeyClient.stamper;
    const publicKey = await this.stamper.init();

    // swap the stamper back in case the user logged in with a different stamper (passkeys)
    this.setStamper(currentStamper);
    const nonce = getOauthNonce(publicKey);
    return this.request("/v1/prepare-oauth", { nonce });
  };

  private getOauthConfigForMode = async (
    mode: OauthMode
  ): Promise<OauthConfig> => {
    if (this.oauthConfig) {
      return this.oauthConfig;
    } else if (mode === "redirect") {
      return this.initOauth();
    } else {
      throw new Error(
        "enablePopupOauth must be set in configuration or signer.preparePopupOauth must be called before using popup-based OAuth login"
      );
    }
  };
}

/**
 * "openid" is a required scope in the OIDC protocol. Insert it if the user
 * forgot.
 *
 * @param {string} scope scope param which may be missing "openid"
 * @returns {string} scope which most definitely contains "openid"
 */
function addOpenIdIfAbsent(scope: string): string {
  return scope.match(/\bopenid\b/) ? scope : `openid ${scope}`;
}
