import {
  type HDAccount,
  type HDOptions,
  type Hex,
  type LocalAccount,
  type PrivateKeyAccount,
  type SignableMessage,
  type SignedAuthorization,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import {
  generatePrivateKey,
  mnemonicToAccount,
  privateKeyToAccount,
} from "viem/accounts";
import type { AuthorizationRequest, SmartAccountSigner } from "./types.js";

/**
 * Represents a local account signer and provides methods to sign messages and transactions, as well as static methods to create the signer from mnemonic or private key.
 */
export class LocalAccountSigner<
  T extends HDAccount | PrivateKeyAccount | LocalAccount
> implements SmartAccountSigner<T>
{
  inner: T;
  signerType: string;

  /**
   * A function to initialize an object with an inner parameter and derive a signerType from it.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { privateKeyToAccount, generatePrivateKey } from "viem";
   *
   * const signer = new LocalAccountSigner(
   *  privateKeyToAccount(generatePrivateKey()),
   * );
   * ```
   *
   * @param {T} inner The inner parameter containing the necessary data
   */
  constructor(inner: T) {
    this.inner = inner;
    this.signerType = inner.type; //  type: "local"
  }

  /**
   * Signs the provided message using the inner signMessage function.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generatePrivateKey } from "viem";
   *
   * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
   * const signature = await signer.signMessage("Hello, world!");
   * ```
   *
   * @param {string} message The message to be signed
   * @returns {Promise<any>} A promise that resolves to the signed message
   */
  readonly signMessage: (message: SignableMessage) => Promise<`0x${string}`> = (
    message
  ) => {
    return this.inner.signMessage({ message });
  };

  /**
   * Signs typed data using the given parameters.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generatePrivateKey } from "viem";
   *
   * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
   * const signature = await signer.signTypedData({
   *  domain: {},
   *  types: {},
   *  primaryType: "",
   *  message: {},
   * });
   * ```
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} params The parameters defining the typed data and primary type
   * @returns {Promise<Hex>} A promise that resolves to the signed data in hexadecimal format
   */
  readonly signTypedData = async <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    return this.inner.signTypedData(params);
  };

  /**
   * Signs an unsigned authorization using the provided private key account.
   *
   * @example
   * ```ts twoslash
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generatePrivateKey } from "viem/accounts";
   *
   * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
   * const signedAuthorization = await signer.signAuthorization({
   *   contractAddress: "0x1234123412341234123412341234123412341234",
   *   chainId: 1,
   *   nonce: 3,
   * });
   * ```
   *
   * @param {AuthorizationRequest<number>} unsignedAuthorization - The unsigned authorization to be signed.
   * @returns {Promise<SignedAuthorization<number>>} A promise that resolves to the signed authorization.
   */

  signAuthorization(
    this: LocalAccountSigner<PrivateKeyAccount>,
    unsignedAuthorization: AuthorizationRequest<number>
  ): Promise<SignedAuthorization<number>> {
    return this.inner.signAuthorization(unsignedAuthorization);
  }

  /**
   * Returns the address of the inner object in a specific hexadecimal format.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generatePrivateKey } from "viem";
   *
   * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
   * const address = await signer.getAddress();
   * ```
   *
   * @returns {Promise<Hex>} A promise that resolves to the address in the format `0x{string}`
   */
  readonly getAddress = async (): Promise<`0x${string}`> => {
    return this.inner.address;
  };

  /**
   * Creates a LocalAccountSigner using the provided mnemonic key and optional HD options.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generateMnemonic } from "viem";
   *
   * const signer = LocalAccountSigner.mnemonicToAccountSigner(generateMnemonic());
   * ```
   *
   * @param {string} key The mnemonic key to derive the account from.
   * @param {HDOptions} [opts] Optional HD options for deriving the account.
   * @returns {LocalAccountSigner<HDAccount>} A LocalAccountSigner object for the derived account.
   */
  static mnemonicToAccountSigner(
    key: string,
    opts?: HDOptions
  ): LocalAccountSigner<HDAccount> {
    const signer = mnemonicToAccount(key, opts);
    return new LocalAccountSigner(signer);
  }

  /**
   * Creates a `LocalAccountSigner` instance using the provided private key.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { generatePrivateKey } from "viem";
   *
   * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
   * ```
   *
   * @param {Hex} key The private key in hexadecimal format
   * @returns {LocalAccountSigner<PrivateKeyAccount>} An instance of `LocalAccountSigner` initialized with the provided private key
   */
  static privateKeyToAccountSigner(
    key: Hex
  ): LocalAccountSigner<PrivateKeyAccount> {
    const signer = privateKeyToAccount(key);
    return new LocalAccountSigner(signer);
  }

  /**
   * Generates a new private key and creates a `LocalAccountSigner` for a `PrivateKeyAccount`.
   *
   * @example
   * ```ts
   * import { LocalAccountSigner } from "@aa-sdk/core";
   *
   * const signer = LocalAccountSigner.generatePrivateKeySigner();
   * ```
   *
   * @returns {LocalAccountSigner<PrivateKeyAccount>} A `LocalAccountSigner` instance initialized with the generated private key account
   */
  static generatePrivateKeySigner(): LocalAccountSigner<PrivateKeyAccount> {
    const signer = privateKeyToAccount(generatePrivateKey());
    return new LocalAccountSigner(signer);
  }
}
