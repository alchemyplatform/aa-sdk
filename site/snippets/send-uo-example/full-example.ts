import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  sepolia,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
});

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);

const connectedProvider = provider.connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: eoaSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);

// this is an example ABI for a contract with a "mint" function
const AlchemyTokenAbi = [
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const uoCallData = encodeFunctionData({
  abi: AlchemyTokenAbi,
  functionName: "mint",
  args: [await connectedProvider.getAddress()],
});

connectedProvider.withAlchemyGasManager({
  policyId: "POLICY_ID", // replace with your policy id, get yours at https://dashboard.alchemy.com/
});

const uo = await connectedProvider.sendUserOperation({
  target: "0xTargetAddress",
  data: uoCallData,
});

const txHash = await connectedProvider.waitForUserOperationTransaction(uo.hash);

console.log(txHash);
