import {
  type AuthorizationRequest,
  type SmartAccountSigner,
  unpackSignRawMessageBytes,
} from "@aa-sdk/core";
import {
  ServerSignerClient,
  type ServerSignerClientParams,
} from "./client/server.js";
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
import type { AccessKeyAuthParams } from "./signer.js";
import { SolanaSigner } from "./solanaSigner.js";
import { p256 } from "@noble/curves/p256";
import { bytesToHex } from "@noble/curves/utils";

/**
 * AlchemyApiKeySigner is a signer that can sign messages and typed data using an API key.
 * It extends the SmartAccountSigner interface and uses the ApiKeySignerClient to sign messages and typed data.
 * Primarily intended to be used server-side.
 */
export class AlchemyServerSigner implements SmartAccountSigner {
  inner: ServerSignerClient;
  signerType = "alchemy-server-signer";

  /**
   * Creates an instance of AlchemyApiKeySigner.
   *
   * @param {ServerSignerClient} client The underlying signer client
   */
  constructor(client: ServerSignerClient) {
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
   * Creates a new instance of `SolanaSigner` using the inner client.
   *
   * @example
   * ```ts
   * import { AlchemyServerSigner } from "@account-kit/signer";
   *
   * const signer = await createServerSigner({
   *   auth: { keyPair },
   *   connection: {
   *     apiKey: "alchemy-api-key",
   *   },
   * });
   *
   * const solanaSigner = signer.toSolanaSigner();
   * ```
   *
   * @returns {SolanaSigner} A new instance of `SolanaSigner`
   */
  toSolanaSigner(): SolanaSigner {
    return new SolanaSigner(this.inner);
  }
}

type CreateServerSignerParams = ServerSignerClientParams & {
  auth: AccessKeyAuthParams;
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
export const createServerSigner = async (
  params: CreateServerSignerParams,
): Promise<AlchemyServerSigner> => {
  const client = new ServerSignerClient(params);
  const signer = new AlchemyServerSigner(client);

  await signer.inner.authenticateWithAccessKey({
    ...params.auth,
    type: "accessKey",
  });

  return signer;
};

/**
 * Generates a new access key for use in the server signer
 *
 * @returns {Hex} A randomly generated access key
 */
export const generateAccessKey = () =>
  bytesToHex(p256.utils.randomPrivateKey());
