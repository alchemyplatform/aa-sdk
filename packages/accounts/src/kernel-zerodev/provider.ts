import {Address, Chain, Transport} from "viem";
import {KernelSmartContractAccount} from "./account";
import {defineReadOnly} from "@alchemy/aa-core/src/utils";
import {
    PublicErc4337Client,
    SmartAccountProvider,
    SmartAccountProviderOpts,
    SupportedTransports
} from "@alchemy/aa-core/src";

export class KernelAccountProvider<
    TTransport extends SupportedTransports = Transport
> extends SmartAccountProvider<TTransport> {


    constructor(
        rpcProvider: string | PublicErc4337Client<TTransport>,
        private entryPointAddress: Address,
        private chain: Chain,
        readonly account?: KernelSmartContractAccount,
        opts?: SmartAccountProviderOpts
    ) {
        super(rpcProvider,entryPointAddress,chain,account,opts)
    }

    connect(
        fn: (provider: PublicErc4337Client<TTransport>) => KernelSmartContractAccount
    ): this & { account: KernelSmartContractAccount } {
        const account = fn(this.rpcClient);
        defineReadOnly(this, "account", account);
        return this as this & { account: typeof account };
    }

    request: (args: { method: string; params?: any[] }) => Promise<any> = async (
        args
    ) => {
        const { method, params } = args;
        if(method === "personal_sign") {
            if (!this.account) {
                throw new Error("account not connected!");
            }
            const [data, address] = params!;
            if (address !== (await this.getAddress())) {
                throw new Error(
                    "cannot sign for address that is not the current account"
                );
            }
            return this.account.signWithEip6492(data);
        } else {
            return super.request(args)
        }
    };

}