import type {Address} from "abitype";
import {
    concatHex,
    encodeAbiParameters,
    encodeFunctionData,
    type FallbackTransport, hashMessage,
    type Hex, toBytes,
    type Transport,
} from "viem";
import {parseAbiParameters} from "abitype";
import {KernelBaseValidator, ValidatorMode} from "./validator/base";
import {KernelAccountAbi} from "./abis/KernelAccountAbi";
import {KernelFactoryAbi} from "./abis/KernelFactoryAbi";
import {BaseSmartAccountParams, BaseSmartContractAccount, SmartAccountSigner} from "@alchemy/aa-core";

export interface KernelSmartAccountParams<
    TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartAccountParams<TTransport> {
    owner: SmartAccountSigner;
    factoryAddress: Address;
    index?: bigint;
    defaultValidator: KernelBaseValidator
    validator?: KernelBaseValidator
}

export class KernelSmartContractAccount<
    TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
    private owner: SmartAccountSigner;
    private readonly factoryAddress: Address;
    private readonly index: bigint;

    private defaultValidator: KernelBaseValidator;
    private validator: KernelBaseValidator;


    constructor(params: KernelSmartAccountParams) {
        super(params);
        this.index = params.index ?? 0n;
        this.owner = params.owner;
        this.factoryAddress = params.factoryAddress;
        this.defaultValidator = params.defaultValidator!
        this.validator = params.validator ?? params.defaultValidator!
    }

    getDummySignature(): Hex {
        return "0x4046ab7d9c387d7a5ef5ca0777eded29767fd9863048946d35b3042d2f7458ff7c62ade2903503e15973a63a296313eab15b964a18d79f4b06c8c01c7028143c1c";
    }

    async encodeExecute(target: Hex, value: bigint, data: Hex): Promise<Hex> {
        if (this.validator.mode !== ValidatorMode.sudo) {
            throw new Error("Validator Mode not supported")
        } else {
            return this.encodeExecuteAction(target, value, data, 0n)
        }
    }

    async encodeExecuteDelegate (target: Hex, value: bigint, data: Hex): Promise<Hex> {
        return this.encodeExecuteAction(target, value, data, 1n)
    }

    async signWithEip6492(msg: string | Uint8Array | Hex): Promise<Hex> {
        try {
            let sig = await this.owner.signMessage(toBytes(hashMessage({raw: toBytes(msg)})))
            // If the account is undeployed, use ERC-6492
            if (!await this.isAccountDeployed()) {
                sig = encodeAbiParameters(
                    parseAbiParameters('address, bytes, bytes'),
                    [
                        this.factoryAddress,
                        await this.getFactoryInitCode(),
                        sig
                    ]
                ) + '6492649264926492649264926492649264926492649264926492649264926492' // magic suffix
            }

            return sig
        } catch (err: any) {
            console.error("Got Error - ",err.message)
            throw new Error("Message Signing with EIP6492 failed")
        }


    }

    signMessage(msg: Uint8Array | string | Hex): Promise<Hex> {
        return this.validator.signMessageWithValidatorParams(toBytes(msg))
    }

    protected encodeExecuteAction(target: Hex, value: bigint, data: Hex, code: bigint): Hex {
        return encodeFunctionData({
            abi: KernelAccountAbi,
            functionName: "execute",
            args: [target, value, data, code],
        });
    }
    protected async getAccountInitCode(): Promise<Hex> {
        return concatHex([
            this.factoryAddress,
            await this.getFactoryInitCode()
        ]);
    }

    protected async getFactoryInitCode(): Promise<Hex> {
        try {
            return encodeFunctionData({
                abi: KernelFactoryAbi,
                functionName: "createAccount",
                args: [this.defaultValidator.getAddress(),await this.defaultValidator.getOwner(), this.index],
            })
        } catch (err: any) {
            console.error("err occurred:",err.message)
            throw new Error("Factory Code generation failed")
        }

    }

}
