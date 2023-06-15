import {Address} from "abitype";
import {HDAccount, HDOptions, Hex} from "viem";
import {mnemonicToAccount, privateKeyToAccount} from "viem/accounts";
import {SmartAccountSigner} from "./types";

export class HdAccountSigner implements SmartAccountSigner {
    owner: HDAccount

    constructor(owner) {
        this.owner = owner;
    }

    signMessage(msg: Uint8Array | Hex | string): Promise<Hex> {
        if (typeof msg === "string") {
            return this.owner.signMessage({
                message: msg
            })
        } else {
            return this.owner.signMessage({
                message: {
                    raw: msg
                }
            })
        }
    }

    getAddress(): Promise<Address> {
        return this.owner.address;
    }

    static mnemonicToHdAccountSigner(mnemonic: string, opts: HDOptions = {}): this {
        const owner = mnemonicToAccount(mnemonic)
        return new HdAccountSigner(owner)
    }

    static privateKeyToHdAccountSigner(key: Hex): this {
        const owner = privateKeyToAccount(key)
        return new HdAccountSigner(owner)
    }
}