import { TurnkeyClient } from "@turnkey/http";
import { jwtDecode } from "jwt-decode";
import {
  hashMessage,
  hashTypedData,
  type Address,
  type Authorization,
  type HashTypedDataParameters,
  type Hex,
  type LocalAccount,
  type SignableMessage,
  parseSignature,
} from "viem";
import type {
  AddOauthProviderParams,
  AuthMethods,
  AuthSessionState,
  AuthType,
  OauthProviderInfo,
  PasskeyInfo,
  TurnkeyStamper,
  User,
} from "./types";
import { toViemLocalAccount } from "./toViemLocalAccount.js";
import { hashAuthorization } from "viem/utils";
import {
  type AlchemyAuthEip1193Provider,
  create1193Provider,
} from "./provider.js";
import { BaseError, type AlchemyRestClient } from "@alchemy/common";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import EventEmitter from "eventemitter3";

/**
 * Parameters required to create an AuthSession instance
 */
export type CreateAuthSessionParams = {
  /** HTTP client for Signer API */
  signerHttpClient: AlchemyRestClient<SignerHttpSchema>;
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
  /** Timestamp in milliseconds at which this session expires */
  expirationDateMs: number;
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

export type AuthSessionEvents = {
  disconnect(): void;
  userUpdated(user: User): void;
};

export type AuthSessionEventType = keyof AuthSessionEvents;

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
 * ```ts twoslash
 * const authSession = await AuthSession.create({
 *   apiKey: "your-api-key",
 *   stamper: turnkeyStamper,
 *   orgId: "org123",
 *   idToken: "token",
 *   authType: "oauth"
 * });
 *
 * const signature = await authSession.signMessage({ message: "Hello World" });
 * const sessionState = authSession.getSerializedState();
 * ```
 */
export class AuthSession {
  private readonly emitter = new EventEmitter<AuthSessionEvents>();
  // Type is any because it differs by environment and doesn't matter.
  private readonly expirationTimeoutId: any;
  private isDisconnected = false;

  private pendingEmailOtpId?: string;
  private pendingPhoneOtpId?: string;

  private constructor(
    private readonly signerHttpClient: AlchemyRestClient<SignerHttpSchema>,
    private readonly turnkey: TurnkeyClient,
    private user: User,
    private readonly expirationDateMs: number,
    private readonly bundle: string | undefined,
    private readonly authType: AuthType | undefined,
    private readonly credentialId: string | undefined,
  ) {
    this.expirationTimeoutId = setTimeout(
      () => this.disconnect(),
      this.expirationDateMs - Date.now(),
    );
  }

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
   * ```ts twoslash
   * const authSession = await AuthSession.create({
   *   apiKey: "your-api-key",
   *   stamper: turnkeyStamper,
   *   orgId: "org123",
   *   idToken: "jwt-token",
   *   bundle: "credential-bundle",
   *   authType: "oauth",
   *   sessionDurationMs: 30 * 60 * 1000 // 30 minutes
   * });
   * ```
   */
  public static async create({
    signerHttpClient,
    stamper,
    orgId,
    idToken,
    bundle,
    authType,
    credentialId,
    expirationDateMs,
  }: CreateAuthSessionParams): Promise<AuthSession> {
    const turnkey = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper,
    );
    const stampedRequest = await turnkey.stampGetWhoami({
      organizationId: orgId,
    });
    const whoamiResponse = await signerHttpClient.request({
      route: "signer/v1/whoami",
      method: "POST",
      body: {
        stampedRequest,
      },
    });
    // TODO: eventually read email out of the id token to display as the user name
    const user = {
      ...whoamiResponse,
      idToken,
      orgId,
      credentialId: authType === "passkey" ? credentialId : undefined,
    };
    return new AuthSession(
      signerHttpClient,
      turnkey,
      user,
      expirationDateMs,
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

  public isConnected(): boolean {
    return !this.isDisconnected;
  }

  /**
   * Gets the expiration timestamp for this authentication session.
   *
   * @returns {number} The session expiration timestamp in milliseconds
   *
   * @example
   * ```ts twoslash
   * const expirationMs = authSession.getExpirationDateMs();
   * const isExpired = expirationMs < Date.now();
   * ```
   */
  public getExpirationDateMs(): number {
    this.throwIfDisconnected();
    return this.expirationDateMs;
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
   * ```ts twoslash
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

    const { signature } = await this.signerHttpClient.request({
      route: "signer/v1/sign-payload",
      method: "POST",
      body: { stampedRequest },
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
   * ```ts twoslash
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
   * ```ts twoslash
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
   * Signs an EIP-7702 authorization.
   *
   * @param {Authorization<number, false>} params - The authorization parameters containing the chain ID, nonce, and address
   * @returns {Promise<Authorization, number, true>} A promise that resolves to the signed authorization with signature components
   *
   * @example
   * ```ts twoslash
   * const authorization = await authSession.signAuthorization({
   *   chainId: 1,
   *   nonce: 123,
   *   address: "0x1234567890123456789012345678901234567890"
   * });
   * ```
   */
  public async signAuthorization(
    params: Authorization<number, false>,
  ): Promise<Authorization<number, true>> {
    const { chainId, nonce, address } = params;
    const hashedAuth = hashAuthorization({ address, chainId, nonce });
    const signatureHex = await this.signRawPayload({
      mode: "ETHEREUM",
      payload: hashedAuth,
    });
    const signature = parseSignature(signatureHex);
    return {
      address,
      chainId,
      nonce,
      ...signature,
    };
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

    return await this.signerHttpClient.request({
      route: "signer/v1/list-auth-methods",
      method: "POST",
      body: {
        suborgId: this.user.orgId,
      },
    });
  }

  private isSendingEmailVerificationCode = false;

  /**
   * Initiates an OTP verification process for adding/changing an email address.
   * Call this first, then use setEmail() with the received code.
   *
   * The OTP will be sent via email to the provided email address.
   * The otpId is stored internally and will be used automatically when calling setEmail().
   *
   * @param {string} email - Email address to verify
   * @returns {Promise<void>} Promise that resolves when OTP is sent
   * @throws {BaseError} If the OTP request fails
   *
   * @example
   * ```ts
   * await authSession.sendEmailVerificationCode("user@example.com");
   * // User receives email with code
   * const code = prompt("Enter code from email:");
   * await authSession.setEmail({ verificationCode: code });
   * ```
   */
  public async sendEmailVerificationCode(email: string): Promise<void> {
    this.throwIfDisconnected();

    if (this.isSendingEmailVerificationCode) {
      throw new BaseError(
        "Code sending is already in progress. Please wait for it to finish before requesting another code.",
      );
    }

    this.isSendingEmailVerificationCode = true;

    try {
      const { otpId } = await this.signerHttpClient.request({
        route: "signer/v1/init-otp",
        method: "POST",
        body: {
          contact: email,
          otpType: "OTP_TYPE_EMAIL",
        },
      });
      this.pendingEmailOtpId = otpId;
    } catch (err) {
      throw err;
    } finally {
      this.isSendingEmailVerificationCode = false;
    }
  }

  /**
   * Sets or updates the email address for authenticated user after verification.
   * Must call sendEmailVerificationCode() first to get the OTP.
   *
   * @param {object} params - The verification parameters
   * @param {string} params.verificationCode - The OTP code received via email
   * @returns {Promise<void>} Promise that resolves when email is set
   * @throws {BaseError} If verification fails, no pending OTP, or user is not authenticated
   *
   * @example
   * ```ts
   * await authSession.sendEmailVerificationCode("user@example.com");
   * const code = "123456"; // Code from email
   * await authSession.setEmail({ verificationCode: code });
   * ```
   */
  public async setEmail({
    verificationCode,
  }: {
    verificationCode: string;
  }): Promise<void> {
    this.throwIfDisconnected();

    if (!this.pendingEmailOtpId) {
      throw new BaseError(
        "No pending email verification. Call sendEmailVerificationCode() first.",
      );
    }

    // Step 1: Verify the OTP to get a signed verification token
    const { verificationToken } = await this.signerHttpClient.request({
      route: "signer/v1/verify-otp",
      method: "POST",
      body: {
        otpId: this.pendingEmailOtpId,
        otpCode: verificationCode,
      },
    });

    // Step 2: Decode token to extract email
    const { contact: email } = jwtDecode<{ contact: string }>(
      verificationToken,
    );

    // Step 3: Create Turnkey stamped request to update email
    const stampedRequest = await this.turnkey.stampUpdateUserEmail({
      type: "ACTIVITY_TYPE_UPDATE_USER_EMAIL",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        userEmail: email,
        verificationToken,
      },
    });

    // Step 4: Submit to backend
    await this.signerHttpClient.request({
      route: "signer/v1/update-email-auth",
      method: "POST",
      body: { stampedRequest },
    });

    // Step 5: Update local user object and clear pending OTP
    this.user = {
      ...this.user,
      email,
    };
    this.pendingEmailOtpId = undefined;
    this.emitter.emit("userUpdated", this.user);
  }

  /**
   * Removes email address from authenticated user account.
   *
   * @returns {Promise<void>} Promise that resolves when email is removed
   * @throws {BaseError} If user is not authenticated or removal fails
   *
   * @example
   * ```ts
   * await authSession.removeEmail();
   * console.log("Email address removed");
   * ```
   */
  public async removeEmail(): Promise<void> {
    this.throwIfDisconnected();

    // Create Turnkey stamped request with empty email
    const stampedRequest = await this.turnkey.stampUpdateUserEmail({
      type: "ACTIVITY_TYPE_UPDATE_USER_EMAIL",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        userEmail: "", // Empty string removes the email
      },
    });

    // Submit to backend
    await this.signerHttpClient.request({
      route: "signer/v1/update-email-auth",
      method: "POST",
      body: { stampedRequest },
    });

    // Update local user object (undefined removes the email)
    this.user = {
      ...this.user,
      email: undefined,
    };
    this.emitter.emit("userUpdated", this.user);
  }

  private isSendingPhoneVerificationCode = false;

  /**
   * Initiates an OTP verification process for adding/changing a phone number.
   * Call this first, then use setPhoneNumber() with the received code.
   *
   * The OTP will be sent via SMS to the provided phone number.
   * The otpId is stored internally and will be used automatically when calling setPhoneNumber().
   *
   * @param {string} phoneNumber - Phone number with country code (e.g., "+15551234567")
   * @returns {Promise<void>} Promise that resolves when OTP is sent
   * @throws {BaseError} If the OTP request fails
   *
   * @example
   * ```ts
   * await authSession.sendPhoneVerificationCode("+15551234567");
   * // User receives SMS with code
   * const code = prompt("Enter code from SMS:");
   * await authSession.setPhoneNumber({ verificationCode: code });
   * ```
   */
  public async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    this.throwIfDisconnected();

    if (this.isSendingPhoneVerificationCode) {
      throw new BaseError(
        "Code sending is already in progress. Please wait for it to finish before requesting another code.",
      );
    }

    this.isSendingPhoneVerificationCode = true;

    try {
      const { otpId } = await this.signerHttpClient.request({
        route: "signer/v1/init-otp",
        method: "POST",
        body: {
          contact: phoneNumber,
          otpType: "OTP_TYPE_SMS",
        },
      });
      this.pendingPhoneOtpId = otpId;
    } catch (err) {
      throw err;
    } finally {
      this.isSendingPhoneVerificationCode = false;
    }
  }

  /**
   * Sets phone number for authenticated user after verification.
   * Must call sendPhoneVerificationCode() first to get the OTP.
   *
   * @param {object} params - The verification parameters
   * @param {string} params.verificationCode - The OTP code received via SMS
   * @returns {Promise<void>} Promise that resolves when phone is set
   * @throws {BaseError} If verification fails, no pending OTP, or user is not authenticated
   *
   * @example
   * ```ts
   * await authSession.sendPhoneVerificationCode("+15551234567");
   * const code = "123456"; // Code from SMS
   * await authSession.setPhoneNumber({ verificationCode: code });
   * ```
   */
  public async setPhoneNumber({
    verificationCode,
  }: {
    verificationCode: string;
  }): Promise<void> {
    this.throwIfDisconnected();

    if (!this.pendingPhoneOtpId) {
      throw new BaseError(
        "No pending phone verification. Call sendPhoneVerificationCode() first.",
      );
    }

    // Step 1: Verify the OTP to get a signed verification token
    const { verificationToken } = await this.signerHttpClient.request({
      route: "signer/v1/verify-otp",
      method: "POST",
      body: {
        otpId: this.pendingPhoneOtpId,
        otpCode: verificationCode,
      },
    });

    // Step 2: Decode token to extract phone number
    const { contact: phoneNumber } = jwtDecode<{ contact: string }>(
      verificationToken,
    );

    // Step 3: Create Turnkey stamped request to update phone
    const stampedRequest = await this.turnkey.stampUpdateUserPhoneNumber({
      type: "ACTIVITY_TYPE_UPDATE_USER_PHONE_NUMBER",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        userPhoneNumber: phoneNumber,
        verificationToken,
      },
    });

    // Step 4: Submit to backend
    await this.signerHttpClient.request({
      route: "signer/v1/update-phone-auth",
      method: "POST",
      body: { stampedRequest },
    });

    // Step 5: Update local user object and clear pending OTP
    this.user = {
      ...this.user,
      phone: phoneNumber,
    };
    this.pendingPhoneOtpId = undefined;
    this.emitter.emit("userUpdated", this.user);
  }

  /**
   * Removes phone number from authenticated user account.
   *
   * @returns {Promise<void>} Promise that resolves when phone is removed
   * @throws {BaseError} If user is not authenticated or removal fails
   *
   * @example
   * ```ts
   * await authSession.removePhoneNumber();
   * console.log("Phone number removed");
   * ```
   */
  public async removePhoneNumber(): Promise<void> {
    this.throwIfDisconnected();

    // Create Turnkey stamped request with empty phone number
    const stampedRequest = await this.turnkey.stampUpdateUserPhoneNumber({
      type: "ACTIVITY_TYPE_UPDATE_USER_PHONE_NUMBER",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        userPhoneNumber: "", // Empty string removes the phone
      },
    });

    // Submit to backend
    await this.signerHttpClient.request({
      route: "signer/v1/update-phone-auth",
      method: "POST",
      body: { stampedRequest },
    });

    // Update local user object (undefined removes the phone)
    this.user = {
      ...this.user,
      phone: undefined,
    };
    this.emitter.emit("userUpdated", this.user);
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
   */
  public disconnect(): void {
    this.isDisconnected = true;
    clearTimeout(this.expirationTimeoutId);
    (this.turnkey.stamper as TurnkeyStamper).clear?.();
    this.emitter.emit("disconnect");
  }

  /**
   * Serializes the current authentication session state to a JSON string.
   *
   * This method creates a serializable representation of the session that includes
   * user information, authentication type, credential bundles (for non-passkey auth),
   * credential IDs (for passkey auth), and expiration time.
   *
   * The serialized state can be stored and later used to restore the session
   * using AuthClient.restoreAuthSession().
   *
   * @returns {string} A JSON string containing the serialized session state
   *
   * @example
   * ```ts twoslash
   * const sessionState = authSession.getSerializedState();
   * localStorage.setItem('authSession', sessionState);
   *
   * // Later restore:
   * const savedState = localStorage.getItem('authSession');
   * if (savedState) {
   *   const restoredSession = await authClient.restoreAuthSession(JSON.parse(savedState));
   * }
   * ```
   */
  public getSerializedState(): string {
    this.throwIfDisconnected();

    // Use the stored expiration time from the instance
    const expirationDateMs = this.expirationDateMs;

    // Use stored authType or default to "otp" for backward compatibility
    const type = this.authType || "otp";

    if (type === "passkey") {
      const state: AuthSessionState = {
        type: "passkey",
        user: this.user,
        expirationDateMs,
        credentialId: this.credentialId,
      };
      return JSON.stringify(state);
    } else {
      if (!this.bundle) {
        throw new BaseError(
          "Bundle is required for non-passkey authentication types",
        );
      }
      const state: AuthSessionState = {
        type,
        bundle: this.bundle,
        user: this.user,
        expirationDateMs,
      };
      return JSON.stringify(state);
    }
  }

  private throwIfDisconnected(): void {
    if (this.isDisconnected) {
      throw new BaseError("Auth session has been disconnected");
    }
  }

  public toViemLocalAccount(): LocalAccount {
    this.throwIfDisconnected();
    return toViemLocalAccount(this);
  }

  public getProvider(): AlchemyAuthEip1193Provider {
    this.throwIfDisconnected();
    return create1193Provider(this);
  }

  /**
   * Attach a listener to an event emitted by the auth session. Returns a
   * cancellation function to remove the listener.
   *
   * @param {AuthSessionEventType} eventType The type of event to listen to.
   * @param {AuthSessionEvents[AuthSessionEventType]} listener The function to run when the event is emitted.
   * @returns {() => void} A function to remove the listener.
   */
  public on<E extends AuthSessionEventType>(
    eventType: E,
    listener: AuthSessionEvents[E] extends (...args: infer Args) => infer R
      ? (...args: Args) => R
      : never,
  ): () => void {
    this.emitter.on(eventType, listener);

    return () => {
      this.emitter.removeListener(eventType, listener);
    };
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new BaseError("Not implemented");
}
