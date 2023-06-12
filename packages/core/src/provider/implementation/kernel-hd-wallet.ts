import {KernelAccountProvider} from "../kernel";
import {Chain, getContract, GetContractReturnType, Hex, PublicClient, Transport} from "viem";
import {BaseValidator, ValidatorMode} from "../../validator/kernel/base";
import {PublicErc4337Client, SupportedTransports} from "../../client/types";
import {HdAccountSigner} from "../../signer/hd-account";
import {EntryPointAbi} from "../../abis/EntryPointAbi";
import {ECDSAValidator} from "../../validator/kernel/ecdsa";
import {KernelSmartAccountParams, KernelSmartContractAccount} from "../../account/kernel";
import {withAlchemyGasManager} from "../../middleware/alchemy-paymaster";
import {ENTRYPOINT_ADDRESS} from "../../global.constants";


export interface KernelHdConfig<TTransport extends SupportedTransports = Transport> {
    mnemonic: string,
    chain: Chain,
    rpcProvider: string | PublicErc4337Client<TTransport>,
    validatorAddress: Hex,
    accountFactoryAddress: Hex,


}

export class KernelHdWalletProvider {
    owner: HdAccountSigner
    chain: Chain
    provider: KernelAccountProvider

    entryPointContract: GetContractReturnType<
        typeof EntryPointAbi,
        PublicClient,
        Chain
    >

    validator: BaseValidator
    accountFactoryAddress: Hex
    constructor(config: KernelHdConfig) {
        this.owner = HdAccountSigner.mnemonicToHdAccountSigner(config.mnemonic)
        this.chain = config.chain
        this.provider = new KernelAccountProvider(
            config.rpcProvider,
            ENTRYPOINT_ADDRESS,
            config.chain
        )
        this.entryPointContract = getContract({
            address: ENTRYPOINT_ADDRESS,
            abi: EntryPointAbi,
            publicClient: this.provider.rpcClient,
        })
        this.validator = new ECDSAValidator({
            validatorAddress: config.validatorAddress,
            mode: ValidatorMode.sudo,
            owner: this.owner
        })

        this.accountFactoryAddress = config.accountFactoryAddress
    }

    connect(index = 0n): KernelAccountProvider {
        const accountParams: KernelSmartAccountParams = {
            rpcClient: this.provider.rpcClient,
            entryPointAddress: ENTRYPOINT_ADDRESS,
            chain: this.chain,
            owner: this.owner,
            factoryAddress: this.accountFactoryAddress,
            index: index,
            defaultValidator: this.validator,
            validator: this.validator
        }
        return this.provider.connect((provider) => new KernelSmartContractAccount(accountParams))
    }

    addAlchemyPaymaster(connectedProvider, gasPolicy) {
        return withAlchemyGasManager(connectedProvider, {
            provider: connectedProvider.rpcClient,
            policyId: gasPolicy,
            entryPoint: ENTRYPOINT_ADDRESS,
        });
    }
}