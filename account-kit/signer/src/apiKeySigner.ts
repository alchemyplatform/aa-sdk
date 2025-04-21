import { type ConnectionConfig, type SmartAccountSigner } from "@aa-sdk/core";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import type {
  AlchemySignerClientEvents,
  AuthenticatingEventMetadata,
  CreateAccountParams,
  EmailAuthParams,
  EnableMfaParams,
  EnableMfaResult,
  GetWebAuthnAttestationResult,
  MfaFactor,
  OauthConfig,
  OauthParams,
  OtpParams,
  RemoveMfaParams,
  SignupResponse,
  SubmitOtpCodeResponse,
  User,
  VerifyMfaParams,
} from "./client/types.js";
import { BaseSignerClient } from "./client/base.js";
import { SmartAccountSignerFromClient } from "./smartAccountSigner.js";

export interface AlchemyApiKeySignerClientParams {
  connection: ConnectionConfig;
  apiKey: {
    publicKey: string;
    privateKey: string;
  };
}

/**
 * AlchemyApiKeySignerClient is a client for signing messages using an API key.
 * It extends the BaseSignerClient and uses the ApiKeyStamper for signing.
 * Primarily intended to be used server-side.
 */
export class AlchemyApiKeySignerClient extends BaseSignerClient<undefined> {
  /**
   * Creates an instance of AlchemyApiKeySignerClient.
   *
   * @param {AlchemyApiKeySignerClientParams} params The parameters for the client, including the API key and connection config
   * @param {ConnectionConfig} params.connection The connection configuration for the client
   * @param {string} params.apiKey.publicKey The public key of the API key
   * @param {string} params.apiKey.privateKey The private key of the API key
   */
  constructor({ connection, apiKey }: AlchemyApiKeySignerClientParams) {
    const stamper = new ApiKeyStamper({
      apiPrivateKey: apiKey.privateKey,
      apiPublicKey: apiKey.publicKey,
    });
    super({ connection, stamper });
  }

  /**
   * Sets the user for the client
   *
   * @param {User} user The user object to set
   */
  public setUser = (user: User) => {
    this.user = user;
  };

  /**
   * Unsets the user for the client
   */
  public override disconnect = async (): Promise<void> => {
    this.user = undefined;
  };

  /**
   * Creates a new user with the given parameters.
   *
   * @param {CreateAccountParams} params The parameters for creating the account
   * @param {string} params.type The type of account to create (only "apiKey" is supported)
   * @param {string} params.publicKey The public key to use to authenticate on behalf of the user
   * @param {string} params.email The email address associated with the user (optional)
   * @returns {Promise<SignupResponse>} A promise that resolves to the signup response
   */
  public override createAccount = async (
    params: CreateAccountParams
  ): Promise<SignupResponse> => {
    if (params.type !== "apiKey") {
      throw new Error(
        "AlchemyApiKeySignerClient only supports account creation via api key"
      );
    }
    return this.request("/v1/signup", {
      apiKey: {
        publicKey: params.publicKey,
      },
      email: params.email,
    });
  };

  override async initEmailAuth(
    _params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string }> {
    throw new Error(
      "Email auth methods are not supported by AlchemyApiKeySignerClient"
    );
  }

  public override async submitOtpCode(
    _args: Omit<OtpParams, "targetPublicKey">
  ): Promise<SubmitOtpCodeResponse> {
    throw new Error(
      "Email auth methods are not supported by AlchemyApiKeySignerClient"
    );
  }

  override async completeAuthWithBundle(_params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User> {
    throw new Error(
      "Auth with bundle is not supported by AlchemyApiKeySignerClient"
    );
  }

  override oauthWithRedirect = async (
    _args: Extract<OauthParams, { mode: "redirect" }>
  ): Promise<User> => {
    throw new Error(
      "OAuth methods are not supported by AlchemyApiKeySignerClient"
    );
  };

  override oauthWithPopup(
    _args: Extract<OauthParams, { mode: "popup" }>
  ): Promise<User> {
    throw new Error(
      "OAuth methods are not supported by AlchemyApiKeySignerClient"
    );
  }

  override exportWallet(_params: unknown): Promise<boolean> {
    throw new Error(
      "Wallet export is not supported by AlchemyApiKeySignerClient"
    );
  }

  override lookupUserWithPasskey(_user?: User): Promise<User> {
    throw new Error(
      "WebAuthn methods are not supported by AlchemyApiKeySignerClient"
    );
  }

  override targetPublicKey(): Promise<string> {
    throw new Error(
      "Target public key is not supported by AlchemyApiKeySignerClient"
    );
  }

  override getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error(
      "WebAuthn methods are not supported by AlchemyApiKeySignerClient"
    );
  }

  override getOauthConfig = async (): Promise<OauthConfig> => {
    throw new Error(
      "OAuth methods are not supported by AlchemyApiKeySignerClient"
    );
  };

  // TODO(jh): this will be moved to the base client, see https://github.com/alchemyplatform/aa-sdk/pull/1542#discussion_r2052673181
  public override getMfaFactors = async () => {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  };

  // TODO(jh): this will be moved to the base client, see https://github.com/alchemyplatform/aa-sdk/pull/1542#discussion_r2052673181
  public override addMfa(_params: EnableMfaParams): Promise<EnableMfaResult> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  // TODO(jh): this will be moved to the base client, see https://github.com/alchemyplatform/aa-sdk/pull/1542#discussion_r2052673181
  public override verifyMfa(_params: VerifyMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  // TODO(jh): this will be moved to the base client, see https://github.com/alchemyplatform/aa-sdk/pull/1542#discussion_r2052673181
  public override removeMfa(_params: RemoveMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  // TODO(jh): this will be moved to the base client, see https://github.com/alchemyplatform/aa-sdk/pull/1542#discussion_r2052673181
  public override validateMultiFactors(_params: {
    encryptedPayload: string;
    multiFactors: { multiFactorId: string; multiFactorCode: string }[];
  }): Promise<{ bundle: string }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }
}

/**
 * Creates a SmartAccountSigner using an AlchemyApiKeySignerClient.
 *
 * @example
 * ```ts
 *  const signer = await createApiKeySigner({
 *   apiKey: {
 *     privateKey: "private-api-key",
 *     publicKey: "public-api-key",
 *   },
 *   connection: {
 *     apiKey: "alchemy-api-key",
 *   },
 * }, "user-org-id");
 *
 * const account = await createModularAccountV2({
 *   transport,
 *   signer,
 *   chain,
 * });
 *
 * const client = createAlchemySmartAccountClient({
 *   account,
 *   transport,
 *   chain,
 * });
 * ```
 *
 * @param {AlchemyApiKeySignerClientParams} clientParams The parameters for the AlchemyApiKeySignerClient
 * @param {string} userOrgId The organization ID of the user
 * @returns {Promise<SmartAccountSigner>} A promise that resolves to a SmartAccountSigner
 * @throws {Error} If the API key is invalid for the given orgId
 */
export const createApiKeySigner = async (
  clientParams: AlchemyApiKeySignerClientParams,
  userOrgId: string
): Promise<SmartAccountSigner> => {
  const client = new AlchemyApiKeySignerClient(clientParams);
  const user = await client.whoami(userOrgId);
  client.setUser(user);
  return new SmartAccountSignerFromClient(client, "alchemy-api-key-signer");
};
