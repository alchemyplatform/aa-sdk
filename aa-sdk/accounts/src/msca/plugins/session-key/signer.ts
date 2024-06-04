import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
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

/**
 * A simple session key signer that uses localStorage or sessionStorage to store
 * a private key. If the key is not found, it will generate a new one and store
 * it in the storage.
 */

export const SESSION_KEY_SIGNER_TYPE_PFX = "alchemy:session-key";
export class SessionKeySigner
  implements SmartAccountSigner<LocalAccountSigner<PrivateKeyAccount>>
{
  signerType: string;
  inner: LocalAccountSigner<PrivateKeyAccount>;
  private storageType: "local-storage" | "session-storage" | Storage;
  private storageKey: string;

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

  getAddress: () => Promise<`0x${string}`> = async () => {
    return this.inner.getAddress();
  };

  signMessage: (msg: SignableMessage) => Promise<`0x${string}`> = async (
    msg
  ) => {
    return this.inner.signMessage(msg);
  };

  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    return this.inner.signTypedData(params);
  };

  /**
   * Generates a new private key and stores it in the storage.
   *
   * @returns The public address of the new key.
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
