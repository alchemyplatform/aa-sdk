import { ConnectionConfigSchema, type ConnectionConfig } from "@aa-sdk/core";
import { TurnkeyClient, type TSignedRequest } from "@turnkey/http";
import EventEmitter from "eventemitter3";
import { jwtDecode } from "jwt-decode";
import {
  hexToBytes,
  recoverPublicKey,
  serializeSignature,
  sha256,
  type Address,
  type Hex,
} from "viem";
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
  RemoveMfaParams,
  EmailAuthParams,
  AddMfaParams,
  AddMfaResult,
  experimental_CreateApiKeyParams,
  GetOauthProviderUrlArgs,
  GetWebAuthnAttestationResult,
  MfaFactor,
  OauthConfig,
  OauthParams,
  OauthState,
  OtpParams,
  SignerBody,
  SignerResponse,
  SignerRoutes,
  SignupResponse,
  User,
  VerifyMfaParams,
  SubmitOtpCodeResponse,
  ValidateMultiFactorsParams,
  AuthLinkingPrompt,
  AddOauthProviderParams,
  CredentialCreationOptionOverrides,
  OauthProviderInfo,
  IdTokenOnly,
  AuthMethods,
} from "./types.js";
import { VERSION } from "../version.js";
import { secp256k1 } from "@noble/curves/secp256k1";
import { Point } from "@noble/secp256k1";

export interface BaseSignerClientParams {
  stamper: TurnkeyClient["stamper"];
  connection: ConnectionConfig;
  rootOrgId?: string;
  rpId?: string;
}

export type ExportWalletStamper = TurnkeyClient["stamper"] & {
  injectWalletExportBundle(bundle: string, orgId: string): Promise<boolean>;
  injectKeyExportBundle(bundle: string, orgId: string): Promise<boolean>;
  publicKey(): string | null;
};

const MFA_PAYLOAD = {
  GET: "get_mfa",
  ADD: "add_mfa",
  DELETE: "delete_mfas",
  VERIFY: "verify_mfa",
  LIST: "list_mfas",
} as const;

const withHexPrefix = (hex: string) => `0x${hex}` as const;

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
      stamper,
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
    const previousUser = this._user;
    this._user = user;
    if (user && !previousUser) {
      this.eventEmitter.emit("connected", user);
    } else if (!user && previousUser) {
      this.eventEmitter.emit("disconnected");
    }
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

  /**
   * Authenticates the user by either email or passkey account creation flow. Emits events during the process.
   *
   * @param {CreateAccountParams} params The parameters for creating an account, including the type (email or passkey) and additional details.
   * @returns {Promise<SignupResponse>} A promise that resolves with the response object containing the account creation result.
   */
  public async createAccount(
    params: CreateAccountParams,
  ): Promise<SignupResponse> {
    if (params.type === "email") {
      this.eventEmitter.emit("authenticating", { type: "otp" });
      const { email, emailMode, expirationSeconds } = params;
      const publicKey = await this.initSessionStamper();

      const response = await this.request("/v1/signup", {
        email,
        emailMode,
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
      { username: "email" in params ? params.email : params.username },
    );

    const result = await this.request("/v1/signup", {
      passkey: {
        challenge:
          typeof challenge === "string"
            ? challenge
            : base64UrlEncode(challenge),
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
    this.initWebauthnStamper(this.user, params.creationOpts);
    this.eventEmitter.emit("connectedPasskey", this.user);

    return result;
  }

  // #region ABSTRACT METHODS

  public abstract initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">,
  ): Promise<{ orgId: string; otpId?: string; multiFactors?: MfaFactor[] }>;

  public abstract completeAuthWithBundle(params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User>;

  public abstract oauthWithRedirect(
    args: Extract<OauthParams, { mode: "redirect" }>,
  ): Promise<User | IdTokenOnly>;

  public abstract oauthWithPopup(
    args: Extract<OauthParams, { mode: "popup" }>,
  ): Promise<User | AuthLinkingPrompt | IdTokenOnly>;

  public abstract submitOtpCode(
    args: Omit<OtpParams, "targetPublicKey">,
  ): Promise<SubmitOtpCodeResponse>;

  public abstract disconnect(): Promise<void>;

  public abstract exportWallet(params: TExportWalletParams): Promise<boolean>;

  public abstract targetPublicKey(): Promise<string>;

  protected abstract getOauthConfig(): Promise<OauthConfig>;

  protected abstract getWebAuthnAttestation(
    options?: CredentialCreationOptionOverrides,
    userDetails?: { username: string },
  ): Promise<GetWebAuthnAttestationResult>;

  /**
   * Initializes the session stamper and returns its public key.
   */
  protected abstract initSessionStamper(): Promise<string>;

  protected abstract initWebauthnStamper(
    user: User | undefined,
    options: CredentialCreationOptionOverrides | undefined,
  ): Promise<void>;

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
    listener: AlchemySignerClientEvents[E],
  ) => {
    this.eventEmitter.on(event, listener as any);

    return () => this.eventEmitter.removeListener(event, listener as any);
  };

  /**
   * Sets the email for the authenticated user, allowing them to login with that
   * email.
   *
   * You must contact Alchemy to enable this feature for your team, as there are
   * important security considerations. In particular, you must not call this
   * without first validating that the user owns this email account.
   *
   * @param {string} email The email to set for the user
   * @returns {Promise<void>} A promise that resolves when the email is set
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public setEmail = async (email: string): Promise<void> => {
    if (!email) {
      throw new Error(
        "Email must not be empty. Use removeEmail() to remove email auth.",
      );
    }
    await this.updateEmail(email);
  };

  /**
   * Removes the email for the authenticated user, disallowing them from login with that email.
   *
   * @returns {Promise<void>} A promise that resolves when the email is removed
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public removeEmail = async (): Promise<void> => {
    // This is a hack to remove the email for the user. Turnkey does not
    // support clearing the email once set, so we set it to a known
    // inaccessible address instead.
    await this.updateEmail("not.enabled@example.invalid");
  };

  private updateEmail = async (email: string): Promise<void> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const stampedRequest = await this.turnkeyClient.stampUpdateUser({
      type: "ACTIVITY_TYPE_UPDATE_USER",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        userEmail: email,
        userTagIds: [],
      },
    });
    await this.request("/v1/update-email-auth", {
      stampedRequest,
    });
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
    const { attestation, challenge } =
      await this.getWebAuthnAttestation(options);

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
            challenge:
              typeof challenge === "string"
                ? challenge
                : base64UrlEncode(challenge),
          },
        ],
      },
    });

    const { authenticatorIds } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "createAuthenticatorsResult",
    );

    return authenticatorIds;
  };

  /**
   * Removes a passkey authenticator from the user's account.
   *
   * @param {string} authenticatorId The ID of the authenticator to remove.
   * @returns {Promise<void>} A promise that resolves when the authenticator is removed.
   * @throws {NotAuthenticatedError} If the user is not authenticated.
   */
  public removePasskey = async (authenticatorId: string): Promise<void> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    await this.turnkeyClient.deleteAuthenticators({
      type: "ACTIVITY_TYPE_DELETE_AUTHENTICATORS",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        authenticatorIds: [authenticatorId],
      },
    });
  };

  /**
   * Asynchronously handles the authentication process using WebAuthn Stamper. If a user is provided, sets the user and returns it. Otherwise, retrieves the current user and initializes the WebAuthn stamper.
   *
   * @param {User} [user] An optional user object to authenticate
   * @returns {Promise<User>} A promise that resolves to the authenticated user object
   */
  public lookupUserWithPasskey = async (user: User | undefined = undefined) => {
    this.eventEmitter.emit("authenticating", { type: "passkey" });
    await this.initWebauthnStamper(user, undefined);
    if (user) {
      this.user = user;
      this.eventEmitter.emit("connectedPasskey", user);
      return user;
    }

    const result = await this.whoami(this.rootOrg);
    await this.initWebauthnStamper(result, undefined);
    this.eventEmitter.emit("connectedPasskey", result);

    return result;
  };

  /**
   * Retrieves the status of the passkey for the current user. Requires the user to be authenticated.
   *
   * @returns {Promise<{ isPasskeyAdded: boolean }>} A promise that resolves to an object containing the passkey status
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public getPasskeyStatus = async () => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const resp = await this.turnkeyClient.getAuthenticators({
      organizationId: this.user.orgId,
      userId: this.user.userId,
    });
    return {
      isPasskeyAdded: resp.authenticators.some((it) =>
        it.authenticatorName.startsWith("passkey-"),
      ),
    };
  };

  /**
   * Adds an OAuth provider for the authenticated user using the provided parameters. Throws an error if the user is not authenticated.
   *
   * @param {AddOauthProviderParams} params The parameters for adding an OAuth provider, including `providerName` and `oidcToken`.
   * @throws {NotAuthenticatedError} Throws if the user is not authenticated.
   * @returns {Promise<void>} A Promise that resolves when the OAuth provider is added.
   */
  public addOauthProvider = async (
    params: AddOauthProviderParams,
  ): Promise<OauthProviderInfo> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const { providerName, oidcToken } = params;
    const stampedRequest = await this.turnkeyClient.stampCreateOauthProviders({
      type: "ACTIVITY_TYPE_CREATE_OAUTH_PROVIDERS",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        oauthProviders: [{ providerName, oidcToken }],
      },
    });
    const response = await this.request("/v1/add-oauth-provider", {
      stampedRequest,
    });
    return response.oauthProviders[0];
  };

  /**
   * Deletes a specified OAuth provider for the authenticated user.
   *
   * @param {string} providerId The ID of the provider to be deleted
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public removeOauthProvider = async (providerId: string) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const stampedRequest = await this.turnkeyClient.stampDeleteOauthProviders({
      type: "ACTIVITY_TYPE_DELETE_OAUTH_PROVIDERS",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        providerIds: [providerId],
      },
    });
    await this.request("/v1/remove-oauth-provider", { stampedRequest });
  };

  /**
   * Retrieves the list of authentication methods for the current user.
   *
   * @returns {Promise<AuthMethods>} A promise that resolves to the list of authentication methods
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  public listAuthMethods = async (): Promise<AuthMethods> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    return await this.request("/v1/list-auth-methods", {
      suborgId: this.user.orgId,
    });
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
    idToken?: string,
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
   * Generates a stamped getOrganization request for the current user.
   *
   * @returns {Promise<TSignedRequest>} a promise that resolves to the "getOrganization" information for the logged in user
   * @throws {Error} if no user is authenticated
   */
  public stampGetOrganization = async (): Promise<TSignedRequest> => {
    if (!this.user) {
      throw new Error(
        "User must be authenticated to stamp a get organization request",
      );
    }

    return await this.turnkeyClient.stampGetOrganization({
      organizationId: this.user.orgId,
    });
  };

  /**
   * Creates an API key that can take any action on behalf of the current user.
   * (Note that this method is currently experimental and is subject to change.)
   *
   * @param {CreateApiKeyParams} params Parameters for creating the API key.
   * @param {string} params.name Name of the API key.
   * @param {string} params.publicKey Public key to be used for the API key.
   * @param {number} params.expirationSec Number of seconds until the API key expires.
   * @throws {Error} If there is no authenticated user or the API key creation fails.
   */
  public experimental_createApiKey = async (
    params: experimental_CreateApiKeyParams,
  ): Promise<void> => {
    if (!this.user) {
      throw new Error("User must be authenticated to create api key");
    }
    const resp = await this.turnkeyClient.createApiKeys({
      type: "ACTIVITY_TYPE_CREATE_API_KEYS_V2",
      timestampMs: new Date().getTime().toString(),
      organizationId: this.user.orgId,
      parameters: {
        apiKeys: [
          {
            apiKeyName: params.name,
            publicKey: params.publicKey,
            curveType: "API_KEY_CURVE_P256",
            expirationSeconds: params.expirationSec.toString(),
          },
        ],
        userId: this.user.userId,
      },
    });
    if (resp.activity.status !== "ACTIVITY_STATUS_COMPLETED") {
      throw new Error("Failed to create api key");
    }
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
    mode: "SOLANA" | "ETHEREUM" = "ETHEREUM",
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

  private experimental_createMultiOwnerStamper = () => ({
    stamp: async (
      request: string,
    ): Promise<{
      stampHeaderName: string;
      stampHeaderValue: string;
    }> => {
      if (!this.user) {
        throw new NotAuthenticatedError();
      }

      // we need this later to recover the public key from the signature, so we don't let turnkey hash
      // this for us and pass HASH_FUNCTION_NO_OP instead
      const hashed = sha256(new TextEncoder().encode(request));

      const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
        organizationId: this.user.orgId,
        type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
        timestampMs: Date.now().toString(),
        parameters: {
          encoding: "PAYLOAD_ENCODING_TEXT_UTF8",
          hashFunction: "HASH_FUNCTION_SHA256",
          payload: request,
          signWith: this.user.address,
        },
      });

      const { signature } = await this.request("/v1/sign-payload", {
        stampedRequest,
      });

      // recover the public key, we can't just use the address
      const recoveredPublicKey = await recoverPublicKey({
        hash: hashed,
        signature,
      });

      // compute the stamp over the original payload using this signature
      // the format here is important
      const stamp = {
        publicKey: Point.fromHex(hexToBytes(recoveredPublicKey)).toHex(true),
        scheme: "SIGNATURE_SCHEME_TK_API_SECP256K1",
        signature: secp256k1.Signature.fromCompact(
          hexToBytes(signature).slice(0, 64),
        ).toDERHex(),
      };

      return {
        stampHeaderName: "X-Stamp",
        stampHeaderValue: base64UrlEncode(Buffer.from(JSON.stringify(stamp))),
      };
    },
  });

  private experimental_createMultiOwnerTurnkeyClient = () =>
    new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      this.experimental_createMultiOwnerStamper(),
    );

  /**
   * This will sign on behalf of the multi-owner org, without doing any transformations on the message.
   * For SignMessage or SignTypedData, the caller should hash the message before calling this method and pass
   * that result here.
   *
   * @param {Hex} msg the hex representation of the bytes to sign
   * @param {string} orgId orgId of the multi-owner org to sign on behalf of
   * @param {string} orgAddress address of the multi-owner org to sign on behalf of
   * @returns {Promise<Hex>} the signature over the raw hex
   */
  public experimental_multiOwnerSignRawMessage = async (
    msg: Hex,
    orgId: string,
    orgAddress: string,
  ) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const multiOwnerClient = this.experimental_createMultiOwnerTurnkeyClient();

    const { result } = await this.request("/v1/multi-owner-sign-raw-payload", {
      stampedRequest: await multiOwnerClient.stampSignRawPayload({
        organizationId: orgId,
        type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
        timestampMs: Date.now().toString(),
        parameters: {
          encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
          hashFunction: "HASH_FUNCTION_NO_OP",
          payload: msg,
          signWith: orgAddress,
        },
      }),
    });

    return serializeSignature({
      r: withHexPrefix(result.signRawPayloadResult.r),
      s: withHexPrefix(result.signRawPayloadResult.s),
      yParity: Number(result.signRawPayloadResult.v), // this is not actually a legacy v value, it's the y parity bit
    });
  };

  /**
   * This will create a multi-owner account with the current user and additional specified signers
   *
   * @param {Address[]} additionalMembers members to add, aside from the currently authenticated user
   * @returns {Promise<SignerResponse<"/v1/multi-owner-create">['result']>} created multi-owner account
   */
  public experimental_createMultiOwner = async (
    additionalMembers: Address[],
  ) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const response = await this.request("/v1/multi-owner-create", {
      members: [this.user.address, ...additionalMembers].map(
        (evmSignerAddress) => ({ evmSignerAddress }),
      ),
    });

    return response.result;
  };

  /**
   * This will add additional members to an existing multi-sig account
   *
   * @param {string} orgId orgId of the multi-sig to add members to
   * @param {Address[]} members the addresses of the members to add
   */
  public experimental_addToMultiOwner = async (
    orgId: string,
    members: Address[],
  ) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const multiOwnerClient = this.experimental_createMultiOwnerTurnkeyClient();

    const prepared = await this.request("/v1/multi-owner-prepare-add", {
      organizationId: orgId,
      members: members.map((evmSignerAddress) => ({ evmSignerAddress })),
    });

    const stampedRequest = await multiOwnerClient.stampCreateUsers(
      prepared.result,
    );

    const {
      result: { updateRootQuorumRequest },
    } = await this.request("/v1/multi-owner-add", {
      stampedRequest,
    });

    await this.request("/v1/multi-owner-update-root-quorum", {
      stampedRequest: await multiOwnerClient.stampUpdateRootQuorum(
        updateRootQuorumRequest,
      ),
    });
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
    body: SignerBody<R>,
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

  /**
   * Retrieves the list of MFA factors configured for the current user.
   *
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to an array of configured MFA factors
   * @throws {NotAuthenticatedError} If no user is authenticated
   */
  public getMfaFactors = async (): Promise<{
    multiFactors: MfaFactor[];
  }> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
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
   * Initiates the setup of a new MFA factor for the current user. Mfa will need to be verified before it is active.
   *
   * @param {AddMfaParams} params The parameters required to enable a new MFA factor
   * @returns {Promise<AddMfaResult>} A promise that resolves to the factor setup information
   * @throws {NotAuthenticatedError} If no user is authenticated
   * @throws {Error} If an unsupported factor type is provided
   */
  public addMfa = async (params: AddMfaParams): Promise<AddMfaResult> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
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
          `Unsupported MFA factor type: ${params.multiFactorType}`,
        );
    }
  };

  /**
   * Verifies a newly created MFA factor to complete the setup process.
   *
   * @param {VerifyMfaParams} params The parameters required to verify the MFA factor
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to the updated list of MFA factors
   * @throws {NotAuthenticatedError} If no user is authenticated
   */
  public verifyMfa = async (
    params: VerifyMfaParams,
  ): Promise<{ multiFactors: MfaFactor[] }> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
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
   * @throws {NotAuthenticatedError} If no user is authenticated
   */
  public removeMfa = async (
    params: RemoveMfaParams,
  ): Promise<{ multiFactors: MfaFactor[] }> => {
    if (!this.user) {
      throw new NotAuthenticatedError();
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
  public validateMultiFactors = async (
    params: ValidateMultiFactorsParams,
  ): Promise<{ bundle: string }> => {
    // Send the encryptedPayload plus TOTP codes, etc:
    const response = await this.request("/v1/auth-validate-multi-factors", {
      encryptedPayload: params.encryptedPayload,
      multiFactors: params.multiFactors,
    });

    // The server is expected to return the *decrypted* payload in `response.payload.credentialBundle`
    if (!response.payload || !response.payload.credentialBundle) {
      throw new Error(
        "Request to validateMultiFactors did not return a credential bundle",
      );
    }

    return {
      bundle: response.payload.credentialBundle,
    };
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
        }),
      ),
    ).then((x) => x.flatMap((x) => x.accounts));

    const walletAccount = walletAccounts.find(
      (x) => x.address === this.user!.address,
    );

    if (!walletAccount) {
      throw new Error(
        `Could not find wallet associated with ${this.user.address}`,
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
      "exportWalletResult",
    );

    const result = await stamper.injectWalletExportBundle(
      exportBundle,
      this.user.orgId,
    );

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
      "exportWalletAccountResult",
    );

    const result = await stamper.injectKeyExportBundle(
      exportBundle,
      this.user.orgId,
    );

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
    args: GetOauthProviderUrlArgs,
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
        !!provider.isCustomProvider === !!isCustomProvider,
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
      fetchIdTokenOnly: oauthParams.fetchIdTokenOnly,
    };
    const state = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(stateObject)),
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
    mode: OauthMode,
  ): Promise<OauthConfig> => {
    if (this.oauthConfig) {
      return this.oauthConfig;
    } else if (mode === "redirect") {
      return this.initOauth();
    } else {
      throw new Error(
        "enablePopupOauth must be set in configuration or signer.preparePopupOauth must be called before using popup-based OAuth login",
      );
    }
  };

  // eslint-disable-next-line eslint-rules/require-jsdoc-on-reexported-functions
  protected pollActivityCompletion = async <
    T extends keyof Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"]["result"],
  >(
    activity: Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"],
    organizationId: string,
    resultKey: T,
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
        `Failed to get activity with with id ${id} (status: ${status})`,
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
