import type { ConnectionConfig } from "@aa-sdk/core";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import type { CreateAccountParams, SignupResponse, User } from "./types";
import { BaseSignerClient } from "./base.js";
import { NotAuthenticatedError, UnsupportedFeatureError } from "../errors.js";
import { TurnkeyClient } from "@turnkey/http";
import type { AuthParams } from "../signer";

export interface ServerSignerClientParams {
  connection: ConnectionConfig;
}

const unimplementedFunction = (feature: string) => {
  return () => {
    throw new UnsupportedFeatureError(feature);
  };
};

const createDummyStamper = () => {
  return {
    stamp: () => {
      throw new NotAuthenticatedError();
    },
  };
};

/**
 * ApiKeySignerClient is a client for signing messages using an API key.
 * It extends the BaseSignerClient and uses the ApiKeyStamper for signing.
 * Primarily intended to be used server-side.
 */
export class ServerSignerClient extends BaseSignerClient<undefined> {
  /**
   * Creates an instance of ApiKeySignerClient.
   *
   * @param {ServerSignerClientParams} params The parameters for the client, including the API key and connection config
   * @param {ConnectionConfig} params.connection The connection configuration for the client
   * @param {string} params.apiKey.publicKey The public key of the API key
   * @param {string} params.apiKey.privateKey The private key of the API key
   */
  constructor({ connection }: ServerSignerClientParams) {
    // we will re-recreate the turnkey client (including the stamper) when we authenticate with an api key
    const stamper = createDummyStamper();

    super({ connection, stamper });
  }

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
    params: CreateAccountParams,
  ): Promise<SignupResponse> => {
    if (params.type !== "accessKey") {
      throw new Error(
        "ServerSignerClient only supports account creation via access key",
      );
    }

    return this.request("/v1/signup", {
      accessKey: {
        publicKey: params.publicKey,
        id: params.id,
      },
    });
  };

  /**
   * Authenticates the user with an API key.
   *
   * @param {Extract<AuthParams, { type: "accessKey" }>} params The parameters for the authentication
   * @returns {Promise<User>} A promise that resolves to the user
   */
  public authenticateWithAccessKey = async (
    params: Extract<AuthParams, { type: "accessKey" }>,
  ): Promise<User> => {
    const user = await this.lookupUserByAccessKey({
      publicKey: params.keyPair.publicKey,
      id: params.id,
    });

    const orgId =
      user?.orgId ??
      (
        await this.createAccount({
          type: "accessKey",
          publicKey: params.keyPair.publicKey,
          id: params.id,
        })
      )?.orgId;

    return this.completeAuthWithApiKey(params.keyPair, orgId);
  };

  private completeAuthWithApiKey = async (
    apiKey: { publicKey: string; privateKey: string },
    subOrgId: string,
  ) => {
    this.turnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      new ApiKeyStamper({
        apiPrivateKey: apiKey.privateKey,
        apiPublicKey: apiKey.publicKey,
      }),
    );

    const user = await this.whoami(subOrgId);
    this.user = user;
    return user;
  };

  public initSmsAuth = unimplementedFunction("Sms auth");
  public submitJwt = unimplementedFunction("Jwt");
  protected initSessionStamper = unimplementedFunction("Sessions");
  protected initWebauthnStamper = unimplementedFunction("Webauthn");
  override initEmailAuth = unimplementedFunction("Email auth");
  public override submitOtpCode = unimplementedFunction("Otp code submission");
  override completeAuthWithBundle = unimplementedFunction("Auth with bundle");
  override oauthWithRedirect = unimplementedFunction("OAuth redirect");
  override oauthWithPopup = unimplementedFunction("OAuth popup");
  override exportWallet = unimplementedFunction("Wallet export");
  override lookupUserWithPasskey = unimplementedFunction("WebAuthn");
  override targetPublicKey = unimplementedFunction("Target public key");
  override getWebAuthnAttestation = unimplementedFunction(
    "WebAuthn attestation",
  );
  override getOauthConfig = unimplementedFunction("OAuth config");
}
