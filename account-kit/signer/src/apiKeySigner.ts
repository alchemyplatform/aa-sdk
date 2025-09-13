import {
  type AuthorizationRequest,
  type SmartAccountSigner,
  unpackSignRawMessageBytes,
} from "@aa-sdk/core";
import {
  ApiKeySignerClient,
  type ApiKeySignerClientParams,
} from "./client/apiKey.js";
import {
  hashMessage,
  hashTypedData,
  type Address,
  type Hex,
  type SignableMessage,
  type SignedAuthorization,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { hashAuthorization } from "viem/utils";
import type { ApiKeyAuthParams, AuthParams } from "./signer.js";
import type { User } from "./client/types.js";

/**
 * AlchemyApiKeySigner is a signer that can sign messages and typed data using an API key.
 * It extends the SmartAccountSigner interface and uses the ApiKeySignerClient to sign messages and typed data.
 * Primarily intended to be used server-side.
 */
export class AlchemyApiKeySigner implements SmartAccountSigner {
  inner: ApiKeySignerClient;
  signerType = "alchemy-api-key-signer";

  /**
   * Creates an instance of AlchemyApiKeySigner.
   *
   * @param {ApiKeySignerClient} client The underlying signer client
   */
  constructor(client: ApiKeySignerClient) {
    this.inner = client;
  }

  /**
   * Gets the address of the user from the signer client.
   *
   * @returns {Promise<Address>} The address of the user
   * @throws {Error} If the user cannot be retrieved from the signer client
   */
  async getAddress(): Promise<Address> {
    const { address } = await this.inner.whoami();
    return address;
  }

  /**
   * Signs a message using the inner client.
   *
   * @param {SignableMessage} msg The message to sign
   * @returns {Promise<Hex>} The signed message
   */
  async signMessage(msg: SignableMessage): Promise<Hex> {
    const messageHash = hashMessage(msg);
    return this.inner.signRawMessage(messageHash);
  }

  /**
   * Signs typed data using the inner client.
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} params The typed data to sign
   * @returns {Promise<Hex>} The signed typed data
   */
  async signTypedData<
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData,
  >(params: TypedDataDefinition<TTypedData, TPrimaryType>): Promise<Hex> {
    const messageHash = hashTypedData(params);
    return this.inner.signRawMessage(messageHash);
  }

  /**
   * Signs an authorization using the inner client.
   *
   * @param {Authorization<number, false>} unsignedAuthorization The unsigned authorization to sign
   * @returns {Promise<Authorization<number, true>>} The signed authorization
   */
  async signAuthorization(
    unsignedAuthorization: AuthorizationRequest<number>,
  ): Promise<SignedAuthorization<number>> {
    const hashedAuthorization = hashAuthorization(unsignedAuthorization);
    const signedAuthorizationHex =
      await this.inner.signRawMessage(hashedAuthorization);
    const signature = unpackSignRawMessageBytes(signedAuthorizationHex);
    const { address, contractAddress, ...unsignedAuthorizationRest } =
      unsignedAuthorization;

    return {
      ...unsignedAuthorizationRest,
      ...signature,
      address: address ?? contractAddress,
    };
  }

  /**
   * Authenticates the signer. Only API key auth is supported.
   *
   * @param {Extract<AuthParams, { type: "apiKey" }>} params The parameters for the authentication
   * @returns {Promise<User>} A promise that resolves to the user
   */
  async authenticate(params: Extract<AuthParams, { type: "apiKey" }>): Promise<User> {
    return this.inner.authenticateWithApiKey(params);
  }
}

type CreateApiKeySignerParams = ApiKeySignerClientParams & {
  auth?: ApiKeyAuthParams
};

type CreateApiKeySignerResponse = {
  signer: AlchemyApiKeySigner;
  orgId?: string;
};

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
 *   userOrgId: 'user-org-id',
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
 *
 * @param {CreateApiKeySignerParams} params Parameters including the connection config, api key, and user org ID
 * @returns {Promise<CreateApiKeySignerResponse>} A promise that resolves to a SmartAccountSigner
 * @throws {Error} If the API key is invalid for the given orgId
 */
export const createApiKeySigner = async (
  params: CreateApiKeySignerParams,
): Promise<CreateApiKeySignerResponse> => {
  const client = new ApiKeySignerClient(params);
  const signer = new AlchemyApiKeySigner(client);

  let { orgId } = params.auth 
    ? await signer.inner.authenticateWithApiKey({ ...params.auth, type: "apiKey" }) 
    : {}
  
  return { signer, orgId }
};