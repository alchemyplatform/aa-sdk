import {
  getAddress,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  type WalletClient,
} from "viem";
import type { Account } from "viem/accounts";
import type { SignTypedDataParameters } from "viem/actions";
import { InvalidSignerTypeError } from "../errors/signer.js";
import type { SmartAccountSigner } from "./types";

/**
 * Represents a wallet client signer for smart accounts, providing methods to get the address, sign messages, and sign typed data.
 */
export class WalletClientSigner implements SmartAccountSigner<WalletClient> {
  signerType: string;
  inner: WalletClient;

  /**
   * Initializes a signer with a given wallet client and signer type.
   *
   * @example
   * ```ts
   * import { WalletClientSigner } from "@aa-sdk/core";
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum!)
   * });
   *
   * const signer = new WalletClientSigner(client, 'wallet');
   * ```
   *
   * @param {WalletClient} client The wallet client to interact with
   * @param {string} signerType The type of signer; must be a valid signer type, otherwise an error will be thrown
   * @throws {InvalidSignerTypeError} If the signer type is invalid
   */
  constructor(client: WalletClient, signerType: string) {
    this.inner = client;
    if (!signerType) {
      throw new InvalidSignerTypeError(signerType);
    }
    this.signerType = signerType;
  }

  /**
   * Asynchronously retrieves addresses from the inner object and returns the first address after applying the `getAddress` function.
   *
   * @example
   * ```ts
   * import { WalletClientSigner } from "@aa-sdk/core";
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum!)
   * });
   *
   * const signer = new WalletClientSigner(client, 'wallet');
   * console.log(await signer.getAddress());
   * ```
   *
   * @returns {Promise<string>} A promise that resolves to the first address after being processed by the `getAddress` function.
   */
  getAddress: () => Promise<`0x${string}`> = async () => {
    let addresses = await this.inner.getAddresses();
    return getAddress(addresses[0]);
  };

  /**
   * Signs a message using the account's signing method.
   *
   * @example
   * ```ts
   * import { WalletClientSigner } from "@aa-sdk/core";
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum!)
   * });
   *
   * const signer = new WalletClientSigner(client, 'wallet');
   * console.log(await signer.signMessage("hello"));
   * ```
   *
   * @param {string} message the message string that needs to be signed
   * @returns {Promise<string>} a promise that resolves to the signed message
   */
  readonly signMessage: (message: SignableMessage) => Promise<`0x${string}`> =
    async (message) => {
      const account = this.inner.account ?? (await this.getAddress());

      return this.inner.signMessage({ message, account });
    };

  /**
   * Signs the provided typed data using the account's private key.
   *
   * @example
   * ```ts
   * import { WalletClientSigner } from "@aa-sdk/core";
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum!)
   * });
   *
   * const signer = new WalletClientSigner(client, 'wallet');
   * console.log(await signer.signTypedData({
   *  types: {
   *    "Message": [{ name: "content", type: "string" }]
   *  },
   *  primaryType: "Message",
   *  message: { content: "Hello" },
   * }));
   * ```
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} typedData The typed data to be signed
   * @returns {Promise<Hex>} A promise that resolves to a hex string representing the signed data
   */
  signTypedData = async <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" | string = string
  >(
    typedData: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    const account = this.inner.account ?? (await this.getAddress());

    const params = {
      account,
      ...typedData,
    } as SignTypedDataParameters<TTypedData, string, Account | undefined>;

    return this.inner.signTypedData<TTypedData, string>(params);
  };
}
