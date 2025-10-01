import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";
import type {
  Hex,
  PrivateKeyAccount,
  SignableMessage,
  TypedData,
  TypedDataDefinition,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { z } from "zod";

export const SessionKeySignerSchema = z.object({
  storageType: z
    .union([z.literal("local-storage"), z.literal("session-storage")])
    .or(z.custom<Storage>())
    .default("local-storage"),
  storageKey: z.string().default("session-key-signer:session-key"),
});

export type SessionKeySignerConfig = z.input<typeof SessionKeySignerSchema>;
export const SESSION_KEY_SIGNER_TYPE_PFX = "alchemy:session-key";

/**
 * A simple session key signer that uses localStorage or sessionStorage to store
 * a private key. If the key is not found, it will generate a new one and store
 * it in the storage.
 */
export class SessionKeySigner
  implements SmartAccountSigner<LocalAccountSigner<PrivateKeyAccount>>
{
  signerType: string;
  inner: LocalAccountSigner<PrivateKeyAccount>;
  private storageType: "local-storage" | "session-storage" | Storage;
  private storageKey: string;

  /**
   * Initializes a new instance of a session key signer with the provided configuration. This will set the `signerType`, `storageKey`, and `storageType`. It will also manage the session key, either fetching it from storage or generating a new one if it doesn't exist.
   *
   * @example
   * ```ts
   * import { SessionKeySigner } from "@account-kit/smart-contracts";
   *
   * const signer = new SessionKeySigner();
   * ```
   *
   * @param {SessionKeySignerConfig} config_ the configuration for initializing the session key signer
   */
  constructor(config_: SessionKeySignerConfig = {}) {
    const config = SessionKeySignerSchema.parse(config_);
    this.signerType = `${SESSION_KEY_SIGNER_TYPE_PFX}`;
    this.storageKey = config.storageKey;
    this.storageType = config.storageType;

    const sessionKey = (() => {
      const storage =
        typeof this.storageType !== "string"
          ? this.storageType
          : this.storageType === "session-storage"
            ? sessionStorage
            : localStorage;
      const key = storage.getItem(this.storageKey);

      if (key) {
        return key;
      } else {
        const newKey = generatePrivateKey();
        storage.setItem(this.storageKey, newKey);
        return newKey;
      }
    })() as Hex;

    this.inner = LocalAccountSigner.privateKeyToAccountSigner(sessionKey);
  }

  /**
   * An async function that retrieves the address using the inner object's `getAddress` method.
   *
   * @example
   * ```ts
   * import { SessionKeySigner } from "@account-kit/smart-contracts";
   *
   * const signer = new SessionKeySigner();
   * const sessionKeyAddress = await signer.getAddress();
   * ```
   *
   * @returns {Promise<string>} A promise that resolves to the address as a string
   */
  getAddress: () => Promise<`0x${string}`> = async () => {
    return this.inner.getAddress();
  };

  /**
   * Signs a message using the inner signer.
   *
   * @example
   * ```ts
   * import { SessionKeySigner } from "@account-kit/smart-contracts";
   *
   * const signer = new SessionKeySigner();
   * const sessionKeyAddress = await signer.signMessage("hello");
   * ```
   *
   * @param {SignableMessage} msg The message to sign
   * @returns {Promise<Hex>} A promise that resolves to the signed message
   */
  signMessage: (msg: SignableMessage) => Promise<`0x${string}`> = async (
    msg,
  ) => {
    return this.inner.signMessage(msg);
  };

  /**
   * Signs the provided typed data using the inner signer.
   *
   * @example
   * ```ts
   * import { SessionKeySigner } from "@account-kit/smart-contracts";
   *
   * const signer = new SessionKeySigner();
   * console.log(await signer.signTypedData({
   *  types: {
   *    "Message": [{ name: "content", type: "string" }]
   *  },
   *  primaryType: "Message",
   *  message: { content: "Hello" },
   * }));
   * ```
   *
   * @template TTypedData - The typed data type, which extends `TypedData` or a record of unknown keys to unknown values.
   * @template TPrimaryType - The primary type of the typed data.
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} params The parameters containing the typed data definition and primary type.
   * @returns {Promise<string>} A promise that resolves to the signed typed data as a string.
   */
  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData,
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>,
  ) => {
    return this.inner.signTypedData(params);
  };

  /**
   * Generates a new private key and stores it in the storage.
   *
   * @example
   * ```ts
   * import { SessionKeySigner } from "@account-kit/smart-contracts";
   *
   * const signer = new SessionKeySigner();
   * const newSessionKey = signer.generateNewKey();
   * ```
   *
   * @returns {Address} The public address of the new key.
   */
  generateNewKey = () => {
    const storage =
      this.storageType === "session-storage" ? sessionStorage : localStorage;

    const newKey = generatePrivateKey();
    storage.setItem(this.storageKey, newKey);
    this.inner = LocalAccountSigner.privateKeyToAccountSigner(newKey);

    return this.inner.inner.address;
  };
}
