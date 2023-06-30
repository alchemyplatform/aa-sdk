import { isHex, type HDAccount, type Hex, type PrivateKeyAccount } from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import type { SmartAccountSigner } from "./types.js";

export class LocalAccountSigner<T extends HDAccount | PrivateKeyAccount>
  implements SmartAccountSigner
{
  private owner: T;
  constructor(owner: T) {
    this.owner = owner;
  }

  readonly signMessage: (msg: string | Uint8Array) => Promise<`0x${string}`> = (
    msg
  ) => {
    if (typeof msg === "string" && !isHex(msg)) {
      return this.owner.signMessage({
        message: msg,
      });
    } else {
      return this.owner.signMessage({
        message: {
          raw: msg,
        },
      });
    }
  };

  readonly getAddress: () => Promise<`0x${string}`> = async () => {
    return this.owner.address;
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
