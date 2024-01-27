import {
  isHex,
  type HDAccount,
  type Hex,
  type LocalAccount,
  type PrivateKeyAccount,
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

  readonly signMessage: (msg: string | Uint8Array) => Promise<`0x${string}`> = (
    msg
  ) => {
    if (typeof msg === "string" && !isHex(msg)) {
      return this.inner.signMessage({
        message: msg,
      });
    } else {
      return this.inner.signMessage({
        message: {
          raw: msg,
        },
      });
    }
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

  static mnemonicToAccountSigner(key: string): LocalAccountSigner<HDAccount> {
    const owner = mnemonicToAccount(key);
    return new LocalAccountSigner(owner);
  }

  static privateKeyToAccountSigner(
    key: Hex
  ): LocalAccountSigner<PrivateKeyAccount> {
    const owner = privateKeyToAccount(key);
    return new LocalAccountSigner(owner);
  }
}
