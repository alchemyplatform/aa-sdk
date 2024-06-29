import {
  type HDAccount,
  type HDOptions,
  type Hex,
  type LocalAccount,
  type PrivateKeyAccount,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import type { SmartAccountSigner } from "./types.js";

/**
 * Represents a local account signer and provides methods to sign messages and transactions, as well as static methods to create the signer from mnemonic or private key.
 */
export class LocalAccountSigner<
  T extends HDAccount | PrivateKeyAccount | LocalAccount
> implements SmartAccountSigner<T>
{
  inner: T;
  signerType: string;

  constructor(inner: T) {
    this.inner = inner;
    this.signerType = inner.type; //  type: "local"
  }

  readonly signMessage: (message: SignableMessage) => Promise<`0x${string}`> = (
    message
  ) => {
    return this.inner.signMessage({ message });
  };

  readonly signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    return this.inner.signTypedData(params);
  };

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
   * const signer = LocalAccountSigner.mnemonicToAccountSigner(generatePrivateKey());
   * ```
   *
   * @param {Hex} key The private key in hexadecimal format
   * @returns {LocalAccountSigner<PrivateKeyAccount>} An instance of `LocalAccountSigner` initialized with the provided private key
   */ static privateKeyToAccountSigner(
    key: Hex
  ): LocalAccountSigner<PrivateKeyAccount> {
    const signer = privateKeyToAccount(key);
    return new LocalAccountSigner(signer);
  }
}
