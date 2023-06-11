import {concatHex, Hex} from "viem";
import {Address} from "abitype";
import {SmartAccountSigner} from "../../interfaces/signer";

export enum ValidatorMode {
    sudo = '0x00000000',
    plugin = '0x00000001',

    //To be enabled later
    // enable = '0x00000002',
}

export interface BaseValidatorParams {
    validatorAddress: `0x${string}`
    mode: ValidatorMode
    owner: SmartAccountSigner
}

export abstract class BaseValidator {
    validatorAddress: `0x${string}`
    mode: ValidatorMode
    owner: SmartAccountSigner

    protected constructor(params: BaseValidatorParams) {
        this.validatorAddress = params.validatorAddress
        this.mode = params.mode
        this.owner = params.owner
    }
    abstract async signMessage(message: string | Uint8Array | Hex): Promise<`0x${string}`>

    getAddress(): `0x${string}` {
        return this.validatorAddress
    }

    async getOwner (): Promise<`0x${string}`> {
        return this.owner.getAddress();
    }
    async getSignature(userOpHash: `0x${string}`): Promise<`0x${string}`> {
        if (this.mode === ValidatorMode.sudo || this.mode === ValidatorMode.plugin) {
            try {
                const signature = await this.signMessage(userOpHash)
                return concatHex([this.mode,signature])
            } catch (err: any) {
                console.log("Got Error - ",err.message)
                throw new Error("Validator failed to sign message")
            }
        } else {
            throw new Error("Validator mode not supported");
        }
    }
}


