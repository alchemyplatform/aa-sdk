import {Address} from "abitype";
import {Hex} from "viem";

export interface SmartAccountSigner {
    signMessage: (msg: Uint8Array) => Promise<Hex>;
    getAddress: () => Promise<Address>;
}