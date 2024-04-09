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

  readonly getAddress: () => Promise<`0x${string}`> = async () => {
    return this.inner.address;
  };

  static mnemonicToAccountSigner(
    key: string,
    opts?: HDOptions
  ): LocalAccountSigner<HDAccount> {
    const signer = mnemonicToAccount(key, opts);
    return new LocalAccountSigner(signer);
  }

  static privateKeyToAccountSigner(
    key: Hex
  ): LocalAccountSigner<PrivateKeyAccount> {
    const signer = privateKeyToAccount(key);
    return new LocalAccountSigner(signer);
  }
}
