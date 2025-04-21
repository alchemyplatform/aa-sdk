import {
  hashMessage,
  hashTypedData,
  type Address,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import type { BaseSignerClient } from ".";
import {
  unpackSignRawMessageBytes,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { hashAuthorization, type Authorization } from "viem/experimental";

/**
 * SmartAccountSignerFromClient is a class that implements the SmartAccountSigner interface.
 * It wraps a BaseSignerClient and provides methods for signing messages, typed data, and authorizations.
 */
export class SmartAccountSignerFromClient implements SmartAccountSigner {
  inner: BaseSignerClient<unknown>;
  signerType: string;

  /**
   * Creates an instance of SmartAccountSignerFromClient.
   *
   * @param {BaseSignerClient<unknown>} client The client to wrap
   * @param {string} signerType The type of the signer
   */
  constructor(client: BaseSignerClient<unknown>, signerType: string) {
    this.inner = client;
    this.signerType = signerType;
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
