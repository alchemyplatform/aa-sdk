import { TurnkeyClient } from "@turnkey/http";
import {
  hashMessage,
  hashTypedData,
  type Address,
  type HashTypedDataParameters,
  type Hex,
  type SignableMessage,
} from "viem";
import type {
  AddOauthProviderParams,
  AuthMethods,
  AuthType,
  OauthProviderInfo,
  PasskeyInfo,
  TurnkeyStamper,
  User,
} from "./types";
import { dev_request } from "./devRequest.js";
import { create1193Provider } from "./provider.js";
import type { AlchemyAuthEip1193Provider } from "./provider.js";

/**
 * Parameters required to create an AuthSession instance
 */
export type CreateAuthSessionParams = {
  // TODO: replace apiKey with transport once it's ready.
  // transport: AlchemyTransport;
  /** API key for authentication with Alchemy services */
  apiKey: string;
  /** Turnkey stamper instance for signing operations */
  stamper: TurnkeyStamper;
  /** Organization ID */
  orgId: string;
  /** ID token from authentication flow */
  idToken: string | undefined;
  /** Credential bundle for serialization (not needed for passkey) */
  bundle?: string;
  /** Authentication method used */
  authType: AuthType;
  /** Credential ID for passkey authentication */
  credentialId?: string;
};

/**
 * Parameters for signing raw payload data
 */
export type SignRawPayloadParams = {
  /** The raw payload to sign as a hex string */
  payload: string;
  /** The blockchain mode for signing */
  mode: "SOLANA" | "ETHEREUM";
};

/**
 * Parameters for signing a message
 */
export type SignMessageParams = {
  /** The message to sign */
  message: SignableMessage;
};

/**
 * AuthSession represents an authenticated user session with Turnkey integration.
 *
 * This class provides methods for:
 * - Signing raw payloads, messages, and typed data
 * - Managing authentication state and session persistence
 * - Handling OAuth providers and passkey authentication
 * - Session serialization for storage and restoration
 *
 * @example
 * ```ts
 * const authSession = await AuthSession.create({
 *   apiKey: "your-api-key",
 *   stamper: turnkeyStamper,
 *   orgId: "org123",
 *   idToken: "token",
 *   authType: "oauth"
 * });
 *
 * const signature = await authSession.signMessage({ message: "Hello World" });
 * const sessionState = authSession.getAuthSessionState();
 * ```
 */
export class AuthSession {
  private isDisconnected = false;

  private constructor(
    // TODO: replace apiKey with transport once it's ready.
    private readonly apiKey: string,
    private readonly turnkey: TurnkeyClient,
    private readonly user: User,
    private readonly bundle?: string,
    private readonly authType?: AuthType,
    private readonly credentialId?: string,
  ) {}

  /**
   * Creates a new AuthSession instance from the provided parameters.
   *
   * This factory method initializes a Turnkey client, performs a whoami request
   * to get user information, and returns a configured AuthSession.
   *
   * @param {CreateAuthSessionParams} params - Configuration parameters for the auth session
   * @returns {Promise<AuthSession>} A promise that resolves to a configured AuthSession instance
   *
   * @example
   * ```ts
   * const authSession = await AuthSession.create({
   *   apiKey: "your-api-key",
   *   stamper: turnkeyStamper,
   *   orgId: "org123",
   *   idToken: "jwt-token",
   *   bundle: "credential-bundle",
   *   authType: "oauth"
   * });
   * ```
   */
  public static async create({
    apiKey,
    stamper,
    orgId,
    idToken,
    bundle,
    authType,
    credentialId,
  }: CreateAuthSessionParams): Promise<AuthSession> {
    const turnkey = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper,
    );
    const stampedRequest = await turnkey.stampGetWhoami({
      organizationId: orgId,
    });
    // TODO: use the transport to make this call once it's finalized.
    const whoamiResponse = await dev_request(apiKey, "whoami", {
      stampedRequest,
    });
    // TODO: combine whoami response with idToken to get the full user object.
    // For now, just return the whoami response.
    const user = {
      ...whoamiResponse,
      idToken,
      orgId,
      credentialId:
        authType === "passkey" ? credentialId : whoamiResponse.credentialId,
    };
    return new AuthSession(
      apiKey,
      turnkey,
      user,
      bundle,
      authType,
      credentialId,
    );
  }

  /**
   * Gets the blockchain address associated with this authenticated session.
   *
   * @returns {Address} The user's blockchain address
   */
  public getAddress(): Address {
    return this.user.address;
  }

  /**
   * Gets the complete user object containing all user information.
   *
   * @returns {User} The user object with address, orgId, credentials, and other metadata
   */
  public getUser(): User {
    return this.user;
  }

  /**
   * Signs a raw payload using the Turnkey stamper.
   *
   * This method handles both Ethereum and Solana signing modes with appropriate
   * hash functions and encoding parameters.
   *
   * @param {SignRawPayloadParams} params - The signing parameters
   * @param {string} params.payload - The raw payload to sign as a hex string
   * @param {"SOLANA" | "ETHEREUM"} params.mode - The blockchain mode for signing
   * @returns {Promise<Hex>} A promise that resolves to the signature as a hex string
   *
   * @example
   * ```ts
   * const signature = await authSession.signRawPayload({
   *   payload: "0x1234...",
   *   mode: "ETHEREUM"
   * });
   * ```
   */
  public signRawPayload = async ({
    payload,
    mode,
  }: SignRawPayloadParams): Promise<Hex> => {
    this.throwIfDisconnected();
    // TODO: we need to add backwards compatibility for users who signed up before we added Solana support

    const stampedRequest = await this.turnkey.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction:
          mode === "ETHEREUM"
            ? "HASH_FUNCTION_NO_OP"
            : "HASH_FUNCTION_NOT_APPLICABLE",
        payload,
        signWith:
          mode === "ETHEREUM" ? this.user.address : this.user.solanaAddress!,
      },
    });

    const { signature } = await this.dev_request("sign-payload", {
      stampedRequest,
    });
    return signature;
  };

  /**
   * Signs an Ethereum message using EIP-191 standard.
   *
   * This method hashes the message and signs it using Ethereum mode.
   *
   * @param {SignMessageParams} params - The message signing parameters
   * @param {SignableMessage} params.message - The message to sign (string, bytes, or hex)
   * @returns {Promise<Hex>} A promise that resolves to the signature as a hex string
   *
   * @example
   * ```ts
   * const signature = await authSession.signMessage({
   *   message: "Hello, world!"
   * });
   * ```
   */
  public signMessage({ message }: SignMessageParams): Promise<Hex> {
    return this.signRawPayload({
      payload: hashMessage(message),
      mode: "ETHEREUM",
    });
  }

  /**
   * Signs typed data using EIP-712 standard.
   *
   * This method hashes the typed data according to EIP-712 specification
   * and signs it using Ethereum mode.
   *
   * @param {HashTypedDataParameters} typedData - The typed data to sign
   * @returns {Promise<Hex>} A promise that resolves to the signature as a hex string
   *
   * @example
   * ```ts
   * const signature = await authSession.signTypedData({
   *   domain: { name: "MyApp", version: "1" },
   *   types: { Message: [{ name: "content", type: "string" }] },
   *   primaryType: "Message",
   *   message: { content: "Hello typed data!" }
   * });
   * ```
   */
  public signTypedData(typedData: HashTypedDataParameters): Promise<Hex> {
    return this.signRawPayload({
      payload: hashTypedData(typedData),
      mode: "ETHEREUM",
    });
  }

  /**
   * Lists all available authentication methods for this user.
   *
   * Returns information about configured email, OAuth providers, and passkeys.
   *
   * @returns {Promise<AuthMethods>} A promise that resolves to the available auth methods
   */
  public async listAuthMethods(): Promise<AuthMethods> {
    this.throwIfDisconnected();
    return notImplemented();
  }

  /**
   * Sets or updates the email address associated with this authentication session.
   *
   * @param {string} email - The email address to set
   * @returns {Promise<void>} A promise that resolves when the email is updated
   */
  public async setEmail(email: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(email);
  }

  /**
   * Adds a new OAuth provider to this user's authentication methods.
   *
   * @param {AddOauthProviderParams} params - The OAuth provider configuration
   * @param {string} params.providerName - The name of the OAuth provider
   * @param {string} params.oidcToken - The OIDC token for provider verification
   * @returns {Promise<OauthProviderInfo>} A promise that resolves to the added provider info
   */
  public async addOauthProvider(
    params: AddOauthProviderParams,
  ): Promise<OauthProviderInfo> {
    this.throwIfDisconnected();
    return notImplemented(params);
  }

  /**
   * Removes an OAuth provider from this user's authentication methods.
   *
   * @param {string} providerId - The ID of the OAuth provider to remove
   * @returns {Promise<void>} A promise that resolves when the provider is removed
   */
  public async removeOauthProvider(providerId: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(providerId);
  }

  /**
   * Adds a new passkey (WebAuthn credential) to this user's authentication methods.
   *
   * @param {CredentialCreationOptions} params - The credential creation options for WebAuthn
   * @returns {Promise<PasskeyInfo>} A promise that resolves to the created passkey info
   */
  public async addPasskey(
    params: CredentialCreationOptions,
  ): Promise<PasskeyInfo> {
    this.throwIfDisconnected();
    return notImplemented(params);
  }

  /**
   * Removes a passkey (WebAuthn credential) from this user's authentication methods.
   *
   * @param {string} authenticatorId - The ID of the authenticator/passkey to remove
   * @returns {Promise<void>} A promise that resolves when the passkey is removed
   */
  public async removePasskey(authenticatorId: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(authenticatorId);
  }

  /**
   * Disconnects and invalidates this authentication session.
   *
   * This method marks the session as disconnected and clears any stored
   * credentials in the Turnkey stamper.
   *
   * @returns {Promise<void>} A promise that resolves when the session is disconnected
   */
  public async disconnect(): Promise<void> {
    this.isDisconnected = true;
    (this.turnkey.stamper as TurnkeyStamper).clear?.();
  }

  /**
   * Serializes the current authentication session state to a JSON string.
   *
   * This method creates a serializable representation of the session that includes
   * user information, authentication type, credential bundles (for non-passkey auth),
   * credential IDs (for passkey auth), and expiration time.
   *
   * The serialized state can be stored and later used to restore the session
   * using AuthClient.loadAuthSessionState().
   *
   * @returns {string} A JSON string containing the serialized session state
   *
   * @example
   * ```ts
   * const sessionState = authSession.getAuthSessionState();
   * localStorage.setItem('authSession', sessionState);
   *
   * // Later restore:
   * const savedState = localStorage.getItem('authSession');
   * if (savedState) {
   *   const restoredSession = await authClient.loadAuthSessionState(JSON.parse(savedState));
   * }
   * ```
   */
  public getAuthSessionState(): string {
    this.throwIfDisconnected();

    // Calculate expiration time (24 hours from now as default)
    const expirationDateMs = Date.now() + 24 * 60 * 60 * 1000;

    // Use stored authType or default to "otp" for backward compatibility
    const type = this.authType || "otp";

    if (type === "passkey") {
      return JSON.stringify({
        type: "passkey",
        user: this.user,
        expirationDateMs,
        credentialId: this.credentialId,
      });
    } else {
      if (!this.bundle) {
        throw new Error(
          "Bundle is required for non-passkey authentication types",
        );
      }
      return JSON.stringify({
        type,
        bundle: this.bundle,
        user: this.user,
        expirationDateMs,
      });
    }
  }

  private throwIfDisconnected(): void {
    if (this.isDisconnected) {
      throw new Error("Auth session has been disconnected");
    }
  }

  public getProvider(): AlchemyAuthEip1193Provider {
    this.throwIfDisconnected();
    return create1193Provider(this);
  }

  // TODO: remove this and use transport instead once it's ready.
  private dev_request(path: string, body: unknown): Promise<any> {
    return dev_request(this.apiKey, path, body);
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
