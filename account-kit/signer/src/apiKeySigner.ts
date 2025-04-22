import {
  type SmartAccountSigner,
  unpackSignRawMessageBytes,
} from "@aa-sdk/core";
import {
  AlchemyApiKeySignerClient,
  type AlchemyApiKeySignerClientParams,
} from "./client/apiKey.js";
import {
  hashMessage,
  hashTypedData,
  type Address,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { hashAuthorization, type Authorization } from "viem/experimental";

export class AlchemyApiKeySigner implements SmartAccountSigner {
  inner: AlchemyApiKeySignerClient;
  signerType = "alchemy-api-key-signer";

  /**
   * Creates an instance of AlchemyApiKeySigner.
   *
   * @param {AlchemyApiKeySignerClient} client The underlying signer client
   */
  constructor(client: AlchemyApiKeySignerClient) {
    this.inner = client;
  }

  /**
   * Gets the address of the user from the signer client.
   *
   * @returns {Promise<Address>} The address of the user
   * @throws {Error} If the user cannot be retrieved from the signer client
   */
  async getAddress(): Promise<Address> {
    const user = await this.inner.whoami();
    if (!user) {
      throw new Error("Failed to get user from signer client");
    }
    return user.address;
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
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
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
    unsignedAuthorization: Authorization<number, false>
  ): Promise<Authorization<number, true>> {
    const hashedAuthorization = hashAuthorization(unsignedAuthorization);
    const signedAuthorizationHex = await this.inner.signRawMessage(
      hashedAuthorization
    );
    const signature = unpackSignRawMessageBytes(signedAuthorizationHex);
    return { ...unsignedAuthorization, ...signature };
  }
}

interface CreateApiKeySignerParams extends AlchemyApiKeySignerClientParams {
  userOrgId: string;
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
 * @returns {Promise<SmartAccountSigner>} A promise that resolves to a SmartAccountSigner
 * @throws {Error} If the API key is invalid for the given orgId
 */
export const createApiKeySigner = async (
  params: CreateApiKeySignerParams
): Promise<SmartAccountSigner> => {
  const { userOrgId, ...clientParams } = params;
  const client = new AlchemyApiKeySignerClient(clientParams);
  // Basically "logs the user in," since calling `whoami` only works if the API
  // key is valid for the given orgId, and sets the active user on the client.
  await client.whoami(userOrgId);
  return new AlchemyApiKeySigner(client);
};
