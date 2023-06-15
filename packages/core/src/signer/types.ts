import {Address} from "abitype";
import {Hex} from "viem";

export interface SmartAccountSigner {
    signMessage: (msg: Uint8Array | Hex | string) => Promise<Hex>;
    getAddress: () => Promise<Address>;
}