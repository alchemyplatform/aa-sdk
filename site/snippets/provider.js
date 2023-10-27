import { LightSmartContractAccount, getDefaultLightAccountFactory, } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, getDefaultEntryPointContract, } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";
const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner = LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);
const entryPointAddress = getDefaultEntryPointContract(chain);
const factoryAddress = getDefaultLightAccountFactory(chain);
export const provider = new AlchemyProvider({
    apiKey: "ALCHEMY_API_KEY",
    chain,
}).connect((rpcClient) => new LightSmartContractAccount({
    entryPointAddress: entryPointAddress,
    chain: rpcClient.chain,
    owner: eoaSigner,
    factoryAddress,
    rpcClient,
}));
