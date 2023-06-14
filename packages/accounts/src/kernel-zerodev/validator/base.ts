import {concatHex, Hex} from "viem";
import {SmartAccountSigner} from "@alchemy/aa-core/src/signer/types";

export enum ValidatorMode {
    sudo = '0x00000000',
    plugin = '0x00000001',

    //To be enabled later
    // enable = '0x00000002',
}

export interface BaseValidatorParams {
    validatorAddress: Hex
    mode: ValidatorMode
    owner: SmartAccountSigner
}

export abstract class BaseValidator {
    readonly validatorAddress: Hex
    mode: ValidatorMode
    owner: SmartAccountSigner

    protected constructor(params: BaseValidatorParams) {
        this.validatorAddress = params.validatorAddress
        this.mode = params.mode
        this.owner = params.owner
    }
    abstract async signMessage(message: string | Uint8Array | Hex): Promise<Hex>

    getAddress(): Hex {
        return this.validatorAddress
    }

    async getOwner (): Promise<Hex> {
        return this.owner.getAddress();
    }
    async getSignature(userOpHash: Uint8Array | string | Hex): Promise<Hex> {
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


