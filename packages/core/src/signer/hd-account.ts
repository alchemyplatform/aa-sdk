import type { Address } from "abitype";
import type { HDAccount, Hex } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import type { SmartAccountSigner } from "./types";

export class HdAccountSigner implements SmartAccountSigner {
  owner: HDAccount;

  constructor(owner: HDAccount) {
    this.owner = owner;
  }

  signMessage(msg: Uint8Array | Hex | string): Promise<Hex> {
    if (typeof msg === "string") {
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
  }

  getAddress(): Promise<Address> {
    return Promise.resolve(this.owner.address);
  }

  static mnemonicToAccountSigner(key: Hex): HdAccountSigner {
    const owner = mnemonicToAccount(key);
    return new HdAccountSigner(owner);
  }
}
