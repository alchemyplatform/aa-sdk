import { type ConnectionConfig, type SmartAccountSigner } from "@aa-sdk/core";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import type { Address } from "abitype";
import {
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  hashMessage,
  hashTypedData,
} from "viem";
import { TurnkeyClient } from "@turnkey/http";
import type { SignRawMessageMode, User } from "./client/types.js";
import { buildStampedSignatureRequestBody } from "./client/base.js";
import { AlchemySignerClient } from "./client/alchemy.js";

interface ApiKeySignerClientParams {
  orgId: string;
  apiKey: {
    publicKey: string;
    privateKey: string;
  };
  connection: ConnectionConfig;
}

/**
 * ApiKeySignerClient is a client that uses an API key to sign messages.
 */
class ApiKeySignerClient {
  protected turnkeyClient: TurnkeyClient;
  protected alchemyClient: AlchemySignerClient;
  private orgId: string;
  private user: User | undefined;

  /**
   * Constructs a new instance of the ApiKeySignerClient.
   *
   * @param {ApiKeySignerClientParams} params The parameters for the client, including the API key and orgId
   */
  constructor(params: ApiKeySignerClientParams) {
    const stamper = new ApiKeyStamper({
      apiPublicKey: params.apiKey.publicKey,
      apiPrivateKey: params.apiKey.privateKey,
    });
    this.turnkeyClient = new TurnkeyClient(
      {
        baseUrl: "https://api.turnkey.com",
      },
      stamper
    );
    this.alchemyClient = new AlchemySignerClient(params.connection);
    this.orgId = params.orgId;
  }

  /**
   * Retrieves the current user information.
   *
   * @returns {Promise<User>} A promise that resolves to the user object
   */
  public whoami = async (): Promise<User> => {
    if (this.user) {
      return this.user;
    }

    const stampedRequest = await this.turnkeyClient.stampGetWhoami({
      organizationId: this.orgId,
    });

    const user = await this.alchemyClient.whoami(stampedRequest);
    this.user = user;
    return user;
  };

  /**
   * Signs a raw message
   *
   * @param {Hex} msg The message to be signed
   * @param {SignRawMessageMode} mode The signing mode (default is "ETHEREUM")
   * @returns {Promise<Hex>} A promise that resolves to the signed message
   */
  public signRawMessage = async (
    msg: Hex,
    mode: SignRawMessageMode = "ETHEREUM"
  ): Promise<Hex> => {
    const user = await this.whoami();

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload(
      buildStampedSignatureRequestBody(user, msg, mode)
    );

    const { signature } = await this.alchemyClient.signPayload(stampedRequest);

    return signature;
  };
}

/**
 * AlchemyApiKeySigner is a SmartAccountSigner that uses an ApiKeySignerClient to sign messages.
 * Primarily intended to be used server-side.
 *
 * @example
 * ```ts
 *  const signer = new AlchemyApiKeySigner({
 *   apiKey: {
 *     privateKey: "private-api-key",
 *     publicKey: "public-api-key",
 *   },
 *   connection: {
 *     apiKey: "alchemy-api-key",
 *   },
 *   orgId: "user-org-id",
 * });
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
 */
export class AlchemyApiKeySigner implements SmartAccountSigner {
  signerType = "alchemy-api-key-signer";
  inner: ApiKeySignerClient;

  /**
   * Constructs a new instance of the AlchemyApiKeySigner.
   *
   * @param {ApiKeySignerClientParams} params The parameters for the client, including the API key and orgId
   */
  constructor(params: ApiKeySignerClientParams) {
    this.inner = new ApiKeySignerClient(params);
  }

  /**
   * Retrieves the current user's address.
   *
   * @returns {Promise<Address>} A promise that resolves to the user's address
   */
  getAddress = async (): Promise<Address> => {
    const { address } = await this.inner.whoami();
    return address;
  };

  /**
   * Signs a message using the inner client.
   *
   * @param {SignableMessage} msg The message to be signed
   * @returns {Promise<Hex>} A promise that resolves to the signed message
   */
  signMessage = async (msg: SignableMessage): Promise<Hex> => {
    const messageHash = hashMessage(msg);
    return await this.inner.signRawMessage(messageHash);
  };

  /**
   * Signs typed data using the inner client.
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} params The typed data to be signed
   * @returns {Promise<Hex>} A promise that resolves to the signed typed data
   */
  signTypedData = async <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    const messageHash = hashTypedData(params);
    return this.inner.signRawMessage(messageHash);
  };
}
