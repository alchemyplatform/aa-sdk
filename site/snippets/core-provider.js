import { LightSmartContractAccount, getDefaultLightAccountFactory, } from "@alchemy/aa-accounts";
import { LocalAccountSigner, SmartAccountProvider, getDefaultEntryPointContract, } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
const chain = polygonMumbai;
const owner = LocalAccountSigner.mnemonicToAccountSigner(YOUR_OWNER_MNEMONIC);
const entryPointAddress = getDefaultEntryPointContract(chain);
const factoryAddress = getDefaultLightAccountFactory(chain);
export const provider = new SmartAccountProvider({
    rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
    chain,
}).connect((rpcClient) => new LightSmartContractAccount({
    entryPointAddress,
    chain,
    factoryAddress,
    rpcClient,
    owner,
}));
