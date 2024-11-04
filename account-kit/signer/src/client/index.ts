import { BaseError, ConnectionConfigSchema } from "@aa-sdk/core";
import { getWebAuthnAttestation } from "@turnkey/http";
import { IframeStamper } from "@turnkey/iframe-stamper";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { z } from "zod";
import { getDefaultScopeAndClaims, getOauthNonce } from "../oauth.js";
import type { AuthParams, OauthMode } from "../signer.js";
import { base64UrlEncode } from "../utils/base64UrlEncode.js";
import { generateRandomBuffer } from "../utils/generateRandomBuffer.js";
import { BaseSignerClient } from "./base.js";
import type {
  AlchemySignerClientEvents,
  AuthenticatingEventMetadata,
  CreateAccountParams,
  CredentialCreationOptionOverrides,
  EmailAuthParams,
  ExportWalletParams,
  OauthConfig,
  OauthParams,
  User,
} from "./types.js";

const CHECK_CLOSE_INTERVAL = 500;

export const AlchemySignerClientParamsSchema = z.object({
  connection: ConnectionConfigSchema,
  iframeConfig: z.object({
    iframeElementId: z.string().default("turnkey-iframe"),
    iframeContainerId: z.string(),
  }),
  rpId: z.string().optional(),
  rootOrgId: z
    .string()
    .optional()
    .default("24c1acf5-810f-41e0-a503-d5d13fa8e830"),
  oauthCallbackUrl: z
    .string()
    .optional()
    .default("https://signer.alchemy.com/callback"),
  enablePopupOauth: z.boolean().optional().default(false),
});

export type AlchemySignerClientParams = z.input<
  typeof AlchemySignerClientParamsSchema
>;

type OauthState = {
  authProviderId: string;
  isCustomProvider?: boolean;
  requestKey: string;
  turnkeyPublicKey: string;
  expirationSeconds?: number;
  redirectUrl?: string;
  openerOrigin?: string;
};

/**
 * A lower level client used by the AlchemySigner used to communicate with
 * Alchemy's signer service.
 */
export class AlchemySignerWebClient extends BaseSignerClient<ExportWalletParams> {
  private iframeStamper: IframeStamper;
  private webauthnStamper: WebauthnStamper;
  oauthCallbackUrl: string;
  iframeContainerId: string;

  /**
   * Initializes a new instance with the given parameters, setting up the connection, iframe configuration, and WebAuthn stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   * ```
   *
   * @param {AlchemySignerClientParams} params the parameters required to initialize the client
   * @param {ConnectionConfig} params.connection The connection details needed to connect to the service
   * @param {{ iframeElementId?: string; iframeContainerId: string }} params.iframeConfig The configuration details for setting up the iframe stamper
   * @param {string} params.rpId The relying party ID, defaulting to the current hostname if not provided
   * @param {string} params.rootOrgId The root organization ID
   */
  constructor(params: AlchemySignerClientParams) {
    const { connection, iframeConfig, rpId, rootOrgId, oauthCallbackUrl } =
      AlchemySignerClientParamsSchema.parse(params);

    const iframeStamper = new IframeStamper({
      iframeElementId: iframeConfig.iframeElementId,
      iframeUrl: "https://auth.turnkey.com",
      iframeContainer: document.getElementById(iframeConfig.iframeContainerId),
    });

    super({
      connection,
      rootOrgId,
      stamper: iframeStamper,
    });

    this.iframeStamper = iframeStamper;
    this.iframeContainerId = iframeConfig.iframeContainerId;

    this.webauthnStamper = new WebauthnStamper({
      rpId: rpId ?? window.location.hostname,
    });

    this.oauthCallbackUrl = oauthCallbackUrl;
  }

  /**
   * Authenticates the user by either email or passkey account creation flow. Emits events during the process.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.createAccount({ type: "email", email: "you@mail.com" });
   * ```
   *
   * @param {CreateAccountParams} params The parameters for creating an account, including the type (email or passkey) and additional details.
   * @returns {Promise<SignupResponse>} A promise that resolves with the response object containing the account creation result.
   */
  public override createAccount = async (params: CreateAccountParams) => {
    if (params.type === "email") {
      this.eventEmitter.emit("authenticating", { type: "email" });
      const { email, expirationSeconds } = params;
      const publicKey = await this.initIframeStamper();

      const response = await this.request("/v1/signup", {
        email,
        targetPublicKey: publicKey,
        expirationSeconds,
        redirectParams: params.redirectParams?.toString(),
      });

      return response;
    }

    this.eventEmitter.emit("authenticating", { type: "passkey" });
    // Passkey account creation flow
    const { attestation, challenge } = await this.getWebAuthnAttestation(
      params.creationOpts,
      { username: "email" in params ? params.email : params.username }
    );

    const result = await this.request("/v1/signup", {
      passkey: {
        challenge: base64UrlEncode(challenge),
        attestation,
      },
      email: "email" in params ? params.email : undefined,
    });

    this.user = {
      orgId: result.orgId,
      address: result.address!,
      userId: result.userId!,
      credentialId: attestation.credentialId,
    };
    this.initWebauthnStamper(this.user);
    this.eventEmitter.emit("connectedPasskey", this.user);

    return result;
  };

  /**
   * Begin authenticating a user with their email and an expiration time for the authentication request. Initializes the iframe stamper to get the target public key.
   * This method sends an email to the user to complete their login
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.initEmailAuth({ email: "you@mail.com" });
   * ```
   *
   * @param {Omit<EmailAuthParams, "targetPublicKey">} params The parameters for email authentication, excluding the target public key
   * @returns {Promise<any>} The response from the authentication request
   */
  public override initEmailAuth = async (
    params: Omit<EmailAuthParams, "targetPublicKey">
  ) => {
    this.eventEmitter.emit("authenticating", { type: "email" });
    const { email, expirationSeconds } = params;
    const publicKey = await this.initIframeStamper();

    return this.request("/v1/auth", {
      email,
      targetPublicKey: publicKey,
      expirationSeconds,
      redirectParams: params.redirectParams?.toString(),
    });
  };

  /**
   * Completes auth for the user by injecting a credential bundle and retrieving
   * the user information based on the provided organization ID. Emits events
   * during the process.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.completeAuthWithBundle({ orgId: "user-org-id", bundle: "bundle-from-email", connectedEventName: "connectedEmail" });
   * ```
   *
   * @param {{ bundle: string; orgId: string, connectedEventName: keyof AlchemySignerClientEvents, idToken?: string }} config
   * The configuration object for the authentication function containing the
   * credential bundle to inject and the organization id associated with the
   * user, as well as the event to be emitted on success and optionally an OIDC
   * ID token with extra user information
   * @returns {Promise<User>} A promise that resolves to the authenticated user
   * information
   */
  public override completeAuthWithBundle = async ({
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
  }): Promise<User> => {
    this.eventEmitter.emit("authenticating", { type: authenticatingType });
    await this.initIframeStamper();

    const result = await this.iframeStamper.injectCredentialBundle(bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(orgId, idToken);

    this.eventEmitter.emit(connectedEventName, user, bundle);

    return user;
  };

  /**
   * Asynchronously handles the authentication process using WebAuthn Stamper. If a user is provided, sets the user and returns it. Otherwise, retrieves the current user and initializes the WebAuthn stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.lookupUserWithPasskey();
   * ```
   *
   * @param {User} [user] An optional user object to authenticate
   * @returns {Promise<User>} A promise that resolves to the authenticated user object
   */
  public override lookupUserWithPasskey = async (
    user: User | undefined = undefined
  ) => {
    this.eventEmitter.emit("authenticating", { type: "passkey" });
    await this.initWebauthnStamper(user);
    if (user) {
      this.user = user;
      return user;
    }

    const result = await this.whoami(this.rootOrg);
    await this.initWebauthnStamper(result);
    this.eventEmitter.emit("connectedPasskey", result);

    return result;
  };

  /**
   * Initiates the export of a wallet by creating an iframe stamper and calling the appropriate export function.
   * The export can be based on a seed phrase or a private key.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.exportWallet({
   *  iframeContainerId: "export-iframe-container",
   * });
   * ```
   *
   * @param {ExportWalletParams} config The parameters for exporting the wallet
   * @param {string} config.iframeContainerId The ID of the container element that will hold the iframe stamper
   * @param {string} [config.iframeElementId] Optional ID for the iframe element
   * @returns {Promise<void>} A promise that resolves when the export process is complete
   */
  public override exportWallet = async ({
    iframeContainerId,
    iframeElementId = "turnkey-export-iframe",
  }: ExportWalletParams) => {
    const exportWalletIframeStamper = new IframeStamper({
      iframeContainer: document.getElementById(iframeContainerId),
      iframeElementId: iframeElementId,
      iframeUrl: "https://export.turnkey.com",
    });
    await exportWalletIframeStamper.init();

    if (this.turnkeyClient.stamper === this.iframeStamper) {
      return this.exportWalletInner({
        exportStamper: exportWalletIframeStamper,
        exportAs: "SEED_PHRASE",
      });
    }

    return this.exportWalletInner({
      exportStamper: exportWalletIframeStamper,
      exportAs: "PRIVATE_KEY",
    });
  };

  /**
   * Asynchronous function that clears the user and resets the iframe stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.disconnect();
   * ```
   */
  public override disconnect = async () => {
    this.user = undefined;
    this.iframeStamper.clear();
    await this.iframeStamper.init();
  };

  /**
   * Redirects the user to the OAuth provider URL based on the provided arguments. This function will always reject after 1 second if the redirection does not occur.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * await client.oauthWithRedirect({
   *   type: "oauth",
   *   authProviderId: "google",
   *   mode: "redirect",
   *   redirectUrl: "/",
   * });
   * ```
   *
   * @param {Extract<AuthParams, { type: "oauth"; mode: "redirect" }>} args The arguments required to obtain the OAuth provider URL
   * @returns {Promise<never>} A promise that will never resolve, only reject if the redirection fails
   */
  public override oauthWithRedirect = async (
    args: Extract<AuthParams, { type: "oauth"; mode: "redirect" }>
  ): Promise<never> => {
    const providerUrl = await this.getOauthProviderUrl(args);
    window.location.href = providerUrl;
    return new Promise((_, reject) =>
      setTimeout(() => reject("Failed to redirect to OAuth provider"), 1000)
    );
  };

  /**
   * Initiates an OAuth authentication flow in a popup window and returns the authenticated user.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const user = await client.oauthWithPopup({
   *  type: "oauth",
   *  authProviderId: "google",
   *  mode: "popup"
   * });
   * ```
   *
   * @param {Extract<AuthParams, { type: "oauth"; mode: "popup" }>} args The authentication parameters specifying OAuth type and popup mode
   * @returns {Promise<User>} A promise that resolves to a `User` object containing the authenticated user information
   */
  public override oauthWithPopup = async (
    args: Extract<AuthParams, { type: "oauth"; mode: "popup" }>
  ): Promise<User> => {
    const providerUrl = await this.getOauthProviderUrl(args);
    const popup = window.open(
      providerUrl,
      "_blank",
      "popup,width=500,height=600"
    );
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        if (!event.data) {
          return;
        }
        const {
          alchemyBundle: bundle,
          alchemyOrgId: orgId,
          alchemyIdToken: idToken,
          alchemyError,
        } = event.data;
        if (bundle && orgId && idToken) {
          cleanup();
          popup?.close();
          this.completeAuthWithBundle({
            bundle,
            orgId,
            connectedEventName: "connectedOauth",
            idToken,
            authenticatingType: "oauth",
          }).then(resolve, reject);
        } else if (alchemyError) {
          cleanup();
          popup?.close();
          reject(new OauthFailedError(alchemyError));
        }
      };

      window.addEventListener("message", handleMessage);

      const checkCloseIntervalId = setInterval(() => {
        if (popup?.closed) {
          cleanup();
          reject(new OauthCancelledError());
        }
      }, CHECK_CLOSE_INTERVAL);

      const cleanup = () => {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkCloseIntervalId);
      };
    });
  };

  private getOauthProviderUrl = async (args: OauthParams): Promise<string> => {
    const {
      authProviderId,
      isCustomProvider,
      auth0Connection,
      scope: providedScope,
      claims: providedClaims,
      mode,
      redirectUrl,
      expirationSeconds,
    } = args;
    const { codeChallenge, requestKey, authProviders } =
      await this.getOauthConfigForMode(mode);
    const authProvider = authProviders.find(
      (provider) =>
        provider.id === authProviderId &&
        !!provider.isCustomProvider === !!isCustomProvider
    );
    if (!authProvider) {
      throw new Error(`No auth provider found with id ${authProviderId}`);
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
      const scopeAndClaims = getDefaultScopeAndClaims(authProviderId);
      if (!scopeAndClaims) {
        throw new Error(
          `Default scope not known for provider ${authProviderId}`
        );
      }
      ({ scope, claims } = scopeAndClaims);
    }
    const { authEndpoint, clientId } = authProvider;
    const turnkeyPublicKey = await this.initIframeStamper();
    const nonce = getOauthNonce(turnkeyPublicKey);
    const stateObject: OauthState = {
      authProviderId,
      isCustomProvider,
      requestKey,
      turnkeyPublicKey,
      expirationSeconds,
      redirectUrl:
        mode === "redirect" ? resolveRelativeUrl(redirectUrl) : undefined,
      openerOrigin: mode === "popup" ? window.location.origin : undefined,
    };
    const state = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(stateObject))
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
    authUrl.search = new URLSearchParams(params).toString();
    return authUrl.toString();
  };

  private initIframeStamper = async () => {
    if (!this.iframeStamper.publicKey()) {
      await this.iframeStamper.init();
    }

    this.setStamper(this.iframeStamper);

    return this.iframeStamper.publicKey()!;
  };

  private initWebauthnStamper = async (user: User | undefined = this.user) => {
    this.setStamper(this.webauthnStamper);
    if (user && user.credentialId) {
      // The goal here is to allow us to cache the allowed credential, but this doesn't work with hybrid transport :(
      this.webauthnStamper.allowCredentials = [
        {
          id: Buffer.from(user.credentialId, "base64"),
          type: "public-key",
          transports: ["internal", "hybrid"],
        },
      ];
    }
  };

  protected override getWebAuthnAttestation = async (
    options?: CredentialCreationOptionOverrides,
    userDetails: { username: string } = {
      username: this.user?.email ?? "anonymous",
    }
  ) => {
    const challenge = generateRandomBuffer();
    const authenticatorUserId = generateRandomBuffer();

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        ...options?.publicKey,
        authenticatorSelection: {
          residentKey: "preferred",
          requireResidentKey: false,
          userVerification: "preferred",
          ...options?.publicKey?.authenticatorSelection,
        },
        challenge,
        rp: {
          id: window.location.hostname,
          name: window.location.hostname,
          ...options?.publicKey?.rp,
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7,
          },
          {
            type: "public-key",
            alg: -257,
          },
        ],
        user: {
          id: authenticatorUserId,
          name: userDetails.username,
          displayName: userDetails.username,
          ...options?.publicKey?.user,
        },
      },
      signal: options?.signal,
    });

    // on iOS sometimes this is returned as empty or null, so handling that here
    if (attestation.transports == null || attestation.transports.length === 0) {
      attestation.transports = [
        "AUTHENTICATOR_TRANSPORT_INTERNAL",
        "AUTHENTICATOR_TRANSPORT_HYBRID",
      ];
    }

    return { challenge, authenticatorUserId, attestation };
  };

  protected override getOauthConfig = async (): Promise<OauthConfig> => {
    const publicKey = await this.initIframeStamper();
    const nonce = getOauthNonce(publicKey);
    return this.request("/v1/prepare-oauth", { nonce });
  };

  private getOauthConfigForMode = async (
    mode: OauthMode
  ): Promise<OauthConfig> => {
    if (this.oauthConfig) {
      return this.oauthConfig;
    } else if (mode === "redirect") {
      const temp = this.initOauth();
      console.log("CLIENT ID", (await temp).authProviders[0].clientId);
      return temp;
    } else {
      throw new Error(
        "enablePopupOauth must be set in configuration or signer.preparePopupOauth must be called before using popup-based OAuth login"
      );
    }
  };
}

function resolveRelativeUrl(url: string): string {
  // Funny trick.
  const a = document.createElement("a");
  a.href = url;
  return a.href;
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

/**
 * This error is thrown when the OAuth flow is cancelled because the auth popup
 * window was closed.
 */
export class OauthCancelledError extends BaseError {
  override name = "OauthCancelledError";

  /**
   * Constructor for initializing an error indicating that the OAuth flow was
   * cancelled.
   */
  constructor() {
    super("OAuth cancelled");
  }
}

/**
 * This error is thrown when an error occurs during the OAuth login flow.
 */
export class OauthFailedError extends BaseError {
  override name = "OauthFailedError";
}
