import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  getDefaultEntryPointContract,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);
const entryPointAddress = getDefaultEntryPointContract(chain);
const factoryAddress = getDefaultLightAccountFactory(chain);

export const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your alchemy api key of the Alchemy app associated with the Gas Manager, get yours at https://dashboard.alchemy.com/
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: entryPointAddress,
      chain: rpcClient.chain,
      owner: eoaSigner,
      factoryAddress,
      rpcClient,
    })
);
