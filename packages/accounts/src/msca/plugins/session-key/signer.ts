import {
  LocalAccountSigner,
  SignerSchema,
  type SignTypedDataParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Hex, PrivateKeyAccount } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { z } from "zod";

export const createSessionKeySignerSchema = <
  TFallback extends SmartAccountSigner
>() => {
  return z.object({
    storageType: z
      .union([z.literal("local-storage"), z.literal("session-storage")])
      .default("local-storage"),
    storageKey: z.string().default("session-key-signer:session-key"),
    fallbackSigner: z.custom<TFallback>((signer) => SignerSchema.parse(signer)),
  });
};

export type SessionKeySignerConfig<TFallback extends SmartAccountSigner> =
  z.input<ReturnType<typeof createSessionKeySignerSchema<TFallback>>>;

/**
 * A simple session key signer that uses localStorage or sessionStorage to store
 * a private key. If the key is not found, it will generate a new one and store
 * it in the storage.
 */

export const SESSION_KEY_SIGNER_TYPE_PFX = "alchemy:session-key";
export class SessionKeySigner<TFallback extends SmartAccountSigner>
  implements SmartAccountSigner<LocalAccountSigner<PrivateKeyAccount>>
{
  signerType: string;
  inner: LocalAccountSigner<PrivateKeyAccount>;
  private keyActive: boolean;
  private fallback: TFallback;
  private storageType: "local-storage" | "session-storage";
  private storageKey: string;

  constructor(config_: SessionKeySignerConfig<TFallback>) {
    const config = createSessionKeySignerSchema<TFallback>().parse(config_);
    this.signerType = `${SESSION_KEY_SIGNER_TYPE_PFX}:${
      config.fallbackSigner!.signerType
    }`;
    this.storageKey = config.storageKey;
    this.storageType = config.storageType;

    const sessionKey = (() => {
      const storage =
        config.storageType === "session-storage"
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
    this.keyActive = true;
    this.fallback = config.fallbackSigner as TFallback;
  }

  getAddress: () => Promise<`0x${string}`> = async () => {
    if (!this.keyActive) {
      return this.fallback.getAddress();
    }

    return this.inner.getAddress();
  };

  signMessage: (msg: string | Uint8Array) => Promise<`0x${string}`> = async (
    msg
  ) => {
    if (!this.keyActive) {
      return this.fallback.signMessage(msg);
    }

    return this.inner.signMessage(msg);
  };

  signTypedData: (params: SignTypedDataParams) => Promise<`0x${string}`> =
    async (params) => {
      if (!this.keyActive) {
        return this.fallback.signTypedData(params);
      }

      return this.inner.signTypedData(params);
    };

  /**
   * Allows you to check if the session key is active or not.
   * If it is not active, the signer is currently using the fallback signer
   *
   * @returns whether or not the session key is active
   */
  isKeyActive = () => {
    return this.keyActive;
  };

  /**
   * Allows toggling the session key on and off. When the session key is off,
   * the fallback signer will be used instead.
   *
   * @param active whether or not to use the session key
   * @returns
   */
  setKeyActive = (active: boolean) => {
    return (this.keyActive = active);
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
    this.keyActive = true;

    return this.inner.inner.address;
  };
}
