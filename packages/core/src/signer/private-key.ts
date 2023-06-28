import type { Address } from "abitype";
import type { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { SmartAccountSigner } from "./types";

export class PrivateKeySigner implements SmartAccountSigner {
  owner: PrivateKeyAccount;

  constructor(owner: PrivateKeyAccount) {
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

  static privateKeyToAccountSigner(key: Hex): PrivateKeySigner {
    const owner = privateKeyToAccount(key);
    return new PrivateKeySigner(owner);
  }
}
