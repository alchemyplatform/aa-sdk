import {BaseValidator} from "./base";
import {Hex, hexToBytes} from "viem";

export class ECDSAValidator extends BaseValidator {
    async signMessage(message: string | Uint8Array | Hex): Promise<`0x${string}`> {
        if (typeof message === "string" && message.startsWith("0x")) {
            message = hexToBytes(message as Hex);
        } else if (typeof message === "string") {
            message = new TextEncoder().encode(message);
        }
        return this.owner.signMessage(message)
    }
}