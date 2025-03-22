import { ConnectionConfigSchema, type ConnectionConfig } from "@aa-sdk/core";
import { TurnkeyClient, type TSignedRequest } from "@turnkey/http";
import EventEmitter from "eventemitter3";
import { jwtDecode } from "jwt-decode";
import { sha256, type Hex } from "viem";
import { NotAuthenticatedError, OAuthProvidersError } from "../errors.js";
import { getDefaultProviderCustomization } from "../oauth.js";
import type { OauthMode } from "../signer.js";
import { base64UrlEncode } from "../utils/base64UrlEncode.js";
import { resolveRelativeUrl } from "../utils/resolveRelativeUrl.js";
import { assertNever } from "../utils/typeAssertions.js";
import type {
  AlchemySignerClientEvent,
  AlchemySignerClientEvents,
  AuthenticatingEventMetadata,
  CreateAccountParams,
  EmailAuthParams,
  GetOauthProviderUrlArgs,
  GetWebAuthnAttestationResult,
  JwtParams,
  JwtResponse,
  OauthConfig,
  OauthParams,
  OauthState,
  OtpParams,
  SignerBody,
  SignerResponse,
  SignerRoutes,
  SignupResponse,
  User,
} from "./types.js";
import { VERSION } from "../version.js";

export interface BaseSignerClientParams {
  stamper: TurnkeyClient["stamper"];
  connection: ConnectionConfig;
  rootOrgId?: string;
  rpId?: string;
}

export type ExportWalletStamper = TurnkeyClient["stamper"] & {
  injectWalletExportBundle(bundle: string): Promise<boolean>;
  injectKeyExportBundle(bundle: string): Promise<boolean>;
  publicKey(): string | null;
};

/**
 * Base class for all Alchemy Signer clients
 */
export abstract class BaseSignerClient<TExportWalletParams = unknown> {
  private _user: User | undefined;
  private connectionConfig: ConnectionConfig;
  protected turnkeyClient: TurnkeyClient;
  protected rootOrg: string;
  protected eventEmitter: EventEmitter<AlchemySignerClientEvents>;
  protected oauthConfig: OauthConfig | undefined;
  /**
   * Create a new instance of the Alchemy Signer client
   *
   * @param {BaseSignerClientParams} params the parameters required to create the client
   */
  constructor(params: BaseSignerClientParams) {
    const { stamper, connection, rootOrgId } = params;
    this.rootOrg = rootOrgId ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830";
    this.eventEmitter = new EventEmitter<AlchemySignerClientEvents>();
    this.connectionConfig = ConnectionConfigSchema.parse(connection);
    this.turnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper
    );
  }

  /**
   * Asynchronously fetches and sets the OAuth configuration.
   *
   * @returns {Promise<OauthConfig>} A promise that resolves to the OAuth configuration
   */
  public initOauth = async (): Promise<OauthConfig> => {
    this.oauthConfig = await this.getOauthConfig();
    return this.oauthConfig;
  };

  protected get user() {
    return this._user;
  }

  protected set user(user: User | undefined) {
    if (user && !this._user) {
      this.eventEmitter.emit("connected", user);
    } else if (!user && this._user) {
      this.eventEmitter.emit("disconnected");
    }

    this._user = user;
  }

  /**
   * Sets the stamper of the TurnkeyClient.
   *
   * @param {TurnkeyClient["stamper"]} stamper the stamper function to set for the TurnkeyClient
   */
  protected setStamper(stamper: TurnkeyClient["stamper"]) {
    this.turnkeyClient.stamper = stamper;
  }

  /**
   * Exports wallet credentials based on the specified type, either as a SEED_PHRASE or PRIVATE_KEY.
   *
   * @param {object} params The parameters for exporting the wallet
   * @param {ExportWalletStamper} params.exportStamper The stamper used for exporting the wallet
   * @param {"SEED_PHRASE" | "PRIVATE_KEY"} params.exportAs Specifies the format for exporting the wallet, either as a SEED_PHRASE or PRIVATE_KEY
   * @returns {Promise<boolean>} A promise that resolves to true if the export is successful
   */
  protected exportWalletInner(params: {
    exportStamper: ExportWalletStamper;
    exportAs: "SEED_PHRASE" | "PRIVATE_KEY";
  }): Promise<boolean> {
    const { exportAs } = params;
    switch (exportAs) {
      case "PRIVATE_KEY":
        return this.exportAsPrivateKey(params.exportStamper);
      case "SEED_PHRASE":
        return this.exportAsSeedPhrase(params.exportStamper);
      default:
        assertNever(exportAs, `Unknown export mode: ${exportAs}`);
    }
  }

  // #region ABSTRACT METHODS

  public abstract createAccount(
    params: CreateAccountParams
  ): Promise<SignupResponse>;

  public abstract initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string; otpId?: string }>;

  public abstract completeAuthWithBundle(params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User>;

  public abstract oauthWithRedirect(
    args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<User | never>;

  public abstract oauthWithPopup(
    args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User>;

  public abstract submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">
  ): Promise<{ bundle: string }>;

  public abstract submitJwt(
    args: Omit<JwtParams, "targetPublicKey">
  ): Promise<JwtResponse>;

  public abstract disconnect(): Promise<void>;

  public abstract exportWallet(params: TExportWalletParams): Promise<boolean>;

  public abstract lookupUserWithPasskey(user?: User): Promise<User>;

  public abstract targetPublicKey(): Promise<string>;

  protected abstract getOauthConfig(): Promise<OauthConfig>;

  protected abstract getWebAuthnAttestation(
    options: CredentialCreationOptions,
    userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult>;

  // #endregion

  // #region PUBLIC METHODS

  /**
   * Listen to events emitted by the client
   *
   * @param {AlchemySignerClientEvent} event the event you want to listen to
   * @param {AlchemySignerClientEvents[AlchemySignerClientEvent]} listener the callback function to execute when an event is fired
   * @returns {() => void} a function that will remove the listener when called
   */
  public on = <E extends AlchemySignerClientEvent>(
    event: E,
    listener: AlchemySignerClientEvents[E]
  ) => {
    this.eventEmitter.on(event, listener as any);

    return () => this.eventEmitter.removeListener(event, listener as any);
  };

  /**
   * Handles the creation of authenticators using WebAuthn attestation and the provided options. Requires the user to be authenticated.
   *
   * @param {CredentialCreationOptions} options The options used to create the WebAuthn attestation
   * @returns {Promise<string[]>} A promise that resolves to an array of authenticator IDs
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public addPasskey = async (options: CredentialCreationOptions) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const { attestation, challenge } = await this.getWebAuthnAttestation(
      options
    );

    const { activity } = await this.turnkeyClient.createAuthenticators({
      type: "ACTIVITY_TYPE_CREATE_AUTHENTICATORS_V2",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        authenticators: [
          {
            attestation,
            authenticatorName: `passkey-${Date.now().toString()}`,
            challenge: base64UrlEncode(challenge),
          },
        ],
      },
    });

    const { authenticatorIds } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "createAuthenticatorsResult"
    );

    return authenticatorIds;
  };

  /**
   * Retrieves the current user or fetches the user information if not already available.
   *
   * @param {string} [orgId] optional organization ID, defaults to the user's organization ID
   * @param {string} idToken an OIDC ID token containing additional user information
   * @returns {Promise<User>} A promise that resolves to the user object
   * @throws {Error} if no organization ID is provided when there is no current user
   */
  public whoami = async (
    orgId = this.user?.orgId,
    idToken?: string
  ): Promise<User> => {
    if (this.user) {
      return this.user;
    }

    if (!orgId) {
      throw new Error("No orgId provided");
    }

    const stampedRequest = await this.turnkeyClient.stampGetWhoami({
      organizationId: orgId,
    });

    const user = await this.request("/v1/whoami", {
      stampedRequest,
    });

    if (idToken) {
      const claims: Record<string, unknown> = jwtDecode(idToken);
      user.idToken = idToken;
      user.claims = claims;
      if (typeof claims.email === "string") {
        user.email = claims.email;
      }
    }

    const credentialId = (() => {
      try {
        return JSON.parse(stampedRequest?.stamp.stampHeaderValue)
          .credentialId as string;
      } catch (e) {
        return undefined;
      }
    })();

    this.user = {
      ...user,
      credentialId,
    };

    return this.user;
  };

  /**
   * Generates a stamped whoami request for the current user. This request can then be used to call /signer/v1/whoami to get the user information.
   * This is useful if you want to get the user information in a different context like a server. You can pass the stamped request to the server
   * and then call our API to get the user information. Using this stamp is the most trusted way to get the user information since a stamp can only
   * belong to the user who created it.
   *
   * @returns {Promise<TSignedRequest>} a promise that resolves to the "whoami" information for the logged in user
   * @throws {Error} if no organization ID is provided
   */
  public stampWhoami = async (): Promise<TSignedRequest> => {
    if (!this.user) {
      throw new Error("User must be authenticated to stamp a whoami request");
    }

    return await this.turnkeyClient.stampGetWhoami({
      organizationId: this.user.orgId,
    });
  };

  /**
   * Looks up information based on an email address.
   *
   * @param {string} email the email address to look up
   * @returns {Promise<any>} the result of the lookup request
   */
  public lookupUserByEmail = async (email: string) => {
    return this.request("/v1/lookup", { email });
  };

  /**
   * This will sign a message with the user's private key, without doing any transformations on the message.
   * For SignMessage or SignTypedData, the caller should hash the message before calling this method and pass
   * that result here.
   *
   * @param {Hex} msg the hex representation of the bytes to sign
   * @param {string} mode specify if signing should happen for solana or ethereum
   * @returns {Promise<Hex>} the signature over the raw hex
   */
  public signRawMessage = async (
    msg: Hex,
    mode: "SOLANA" | "ETHEREUM" = "ETHEREUM"
  ): Promise<Hex> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    if (!this.user.solanaAddress && mode === "SOLANA") {
      // TODO: we need to add backwards compatibility for users who signed up before we added Solana support
      throw new Error("No Solana address available for the user");
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction:
          mode === "ETHEREUM"
            ? "HASH_FUNCTION_NO_OP"
            : "HASH_FUNCTION_NOT_APPLICABLE",
        payload: msg,
        signWith:
          mode === "ETHEREUM" ? this.user.address : this.user.solanaAddress!,
      },
    });

    const { signature } = await this.request("/v1/sign-payload", {
      stampedRequest,
    });

    return signature;
  };

  /**
   * Returns the current user or null if no user is set.
   *
   * @returns {User | null} the current user object or null if no user is available
   */
  public getUser = (): User | null => {
    return this.user ?? null;
  };

  /**
   * Sends a POST request to the given signer route with the specified body and returns the response.
   * Not intended to be used directly, use the specific methods instead on the client instead.
   *
   * @param {SignerRoutes} route The route to which the request should be sent
   * @param {SignerBody<R>} body The request body containing the data to be sent
   * @returns {Promise<SignerResponse<R>>} A promise that resolves to the response from the signer
   */
  public request = async <R extends SignerRoutes>(
    route: R,
    body: SignerBody<R>
  ): Promise<SignerResponse<R>> => {
    const url = this.connectionConfig.rpcUrl ?? "https://api.g.alchemy.com";

    const basePath = "/signer";

    const headers = new Headers();
    headers.append("Alchemy-AA-Sdk-Version", VERSION);
    headers.append("Content-Type", "application/json");
    if (this.connectionConfig.apiKey) {
      headers.append("Authorization", `Bearer ${this.connectionConfig.apiKey}`);
    } else if (this.connectionConfig.jwt) {
      headers.append("Authorization", `Bearer ${this.connectionConfig.jwt}`);
    }

    const response = await fetch(`${url}${basePath}${route}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const json = await response.json();

    return json as SignerResponse<R>;
  };

  // #endregion

  // #region PRIVATE METHODS
  private exportAsSeedPhrase = async (stamper: ExportWalletStamper) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const { wallets } = await this.turnkeyClient.getWallets({
      organizationId: this.user.orgId,
    });

    const walletAccounts = await Promise.all(
      wallets.map(({ walletId }) =>
        this.turnkeyClient.getWalletAccounts({
          organizationId: this.user!.orgId,
          walletId,
        })
      )
    ).then((x) => x.flatMap((x) => x.accounts));

    const walletAccount = walletAccounts.find(
      (x) => x.address === this.user!.address
    );

    if (!walletAccount) {
      throw new Error(
        `Could not find wallet associated with ${this.user.address}`
      );
    }

    const { activity } = await this.turnkeyClient.exportWallet({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_EXPORT_WALLET",
      timestampMs: Date.now().toString(),
      parameters: {
        walletId: walletAccount!.walletId,
        targetPublicKey: stamper.publicKey()!,
      },
    });

    const { exportBundle } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "exportWalletResult"
    );

    const result = await stamper.injectWalletExportBundle(exportBundle);

    if (!result) {
      throw new Error("Failed to inject wallet export bundle");
    }

    return result;
  };

  private exportAsPrivateKey = async (stamper: ExportWalletStamper) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const { activity } = await this.turnkeyClient.exportWalletAccount({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_EXPORT_WALLET_ACCOUNT",
      timestampMs: Date.now().toString(),
      parameters: {
        address: this.user.address,
        targetPublicKey: stamper.publicKey()!,
      },
    });

    const { exportBundle } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "exportWalletAccountResult"
    );

    const result = await stamper.injectKeyExportBundle(exportBundle);

    if (!result) {
      throw new Error("Failed to inject wallet export bundle");
    }

    return result;
  };

  /**
   * Returns the authentication url for the selected OAuth Proivder
   *
   * @example
   * ```ts
   *
   * cosnt oauthParams = {
   *  authProviderId: "google",
   *  isCustomProvider: false,
   *  auth0Connection: undefined,
   *  scope: undefined,
   *  claims: undefined,
   *  mode: "redirect",
   *  redirectUrl: "https://your-url-path/oauth-return",
   *  expirationSeconds: 3000
   * };
   *
   * const turnkeyPublicKey = await this.initIframeStamper();
   * const oauthCallbackUrl = this.oauthCallbackUrl;
   * const oauthConfig = this.getOauthConfig() // Optional value for OauthConfig()
   * const usesRelativeUrl = true // Optional value to determine if we use a relative (or absolute) url for the `redirect_url`
   *
   * const oauthProviderUrl = getOauthProviderUrl({
   *  oauthParams,
   *  turnkeyPublicKey,
   *  oauthCallbackUrl
   * })
   *
   * ```
   * @param {GetOauthProviderUrlArgs} args Required. The Oauth provider's auth parameters
   *
   * @returns {Promise<string>} returns the Oauth provider's url
   */
  protected getOauthProviderUrl = async (
    args: GetOauthProviderUrlArgs
  ): Promise<string> => {
    const {
      oauthParams,
      turnkeyPublicKey,
      oauthCallbackUrl,
      oauthConfig,
      usesRelativeUrl = true,
    } = args;

    const {
      authProviderId,
      isCustomProvider,
      auth0Connection,
      scope: providedScope,
      claims: providedClaims,
      otherParameters: providedOtherParameters,
      mode,
      redirectUrl,
      expirationSeconds,
    } = oauthParams;

    const { codeChallenge, requestKey, authProviders } =
      oauthConfig ?? (await this.getOauthConfigForMode(mode));

    if (!authProviders) {
      throw new OAuthProvidersError();
    }

    const authProvider = authProviders.find(
      (provider) =>
        provider.id === authProviderId &&
        !!provider.isCustomProvider === !!isCustomProvider
    );

    if (!authProvider) {
      throw new Error(`No auth provider found with id ${authProviderId}`);
    }

    let scope: string | undefined = providedScope;
    let claims: string | undefined = providedClaims;
    let otherParameters: Record<string, string> | undefined =
      providedOtherParameters;

    if (!isCustomProvider) {
      const defaultCustomization =
        getDefaultProviderCustomization(authProviderId);
      scope ??= defaultCustomization?.scope;
      claims ??= defaultCustomization?.claims;
      otherParameters ??= defaultCustomization?.otherParameters;
    }
    if (!scope) {
      throw new Error(`Default scope not known for provider ${authProviderId}`);
    }
    const { authEndpoint, clientId } = authProvider;

    const nonce = this.getOauthNonce(turnkeyPublicKey);
    const stateObject: OauthState = {
      authProviderId,
      isCustomProvider,
      requestKey,
      turnkeyPublicKey,
      expirationSeconds,
      redirectUrl:
        mode === "redirect"
          ? usesRelativeUrl
            ? resolveRelativeUrl(redirectUrl)
            : redirectUrl
          : undefined,
      openerOrigin: mode === "popup" ? window.location.origin : undefined,
    };
    const state = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(stateObject))
    );
    const authUrl = new URL(authEndpoint);
    const params: Record<string, string> = {
      redirect_uri: oauthCallbackUrl,
      response_type: "code",
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
      client_id: clientId,
      nonce,
      ...otherParameters,
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

    return `${urlPath?.replace(/\/$/, "")}?${searchParams}`;
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

  // eslint-disable-next-line eslint-rules/require-jsdoc-on-reexported-functions
  protected pollActivityCompletion = async <
    T extends keyof Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"]["result"]
  >(
    activity: Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"],
    organizationId: string,
    resultKey: T
  ): Promise<
    NonNullable<
      Awaited<
        ReturnType<(typeof this.turnkeyClient)["getActivity"]>
      >["activity"]["result"][T]
    >
  > => {
    if (activity.status === "ACTIVITY_STATUS_COMPLETED") {
      return activity.result[resultKey]!;
    }

    const {
      activity: { status, id, result },
    } = await this.turnkeyClient.getActivity({
      activityId: activity.id,
      organizationId,
    });

    if (status === "ACTIVITY_STATUS_COMPLETED") {
      return result[resultKey]!;
    }

    if (
      status === "ACTIVITY_STATUS_FAILED" ||
      status === "ACTIVITY_STATUS_REJECTED" ||
      status === "ACTIVITY_STATUS_CONSENSUS_NEEDED"
    ) {
      throw new Error(
        `Failed to get activity with with id ${id} (status: ${status})`
      );
    }

    // TODO: add ability to configure this + add exponential backoff
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.pollActivityCompletion(activity, organizationId, resultKey);
  };
  // #endregion

  /**
   * Turnkey requires the nonce in the id token to be in this format.
   *
   * @param {string} turnkeyPublicKey key from a Turnkey iframe
   * @returns {string} nonce to be used in OIDC
   */
  protected getOauthNonce = (turnkeyPublicKey: string): string => {
    return sha256(new TextEncoder().encode(turnkeyPublicKey)).slice(2);
  };
}
