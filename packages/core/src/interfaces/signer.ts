import {Address} from "abitype";

export interface SmartAccountSigner {
    signMessage: (msg: Uint8Array) => Promise<Address>;
    getAddress: () => Promise<Address>;
}
