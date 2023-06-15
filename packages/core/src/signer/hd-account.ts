import {Address} from "abitype";
import {HDAccount, HDOptions, Hex, toHex} from "viem";
import {mnemonicToAccount, privateKeyToAccount} from "viem/accounts";
import {SmartAccountSigner} from "./types";

export class HdAccountSigner implements SmartAccountSigner {
    owner: HDAccount
    constructor(owner) {
        this.owner = owner;
    }

    signMessage(msg: Uint8Array): Promise<Hex> {
        return this.owner.signMessage({
            message: toHex(msg),
        })
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
