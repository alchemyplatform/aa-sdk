import { createModularAccountAlchemyClient } from "@account-kit/core";
import {
  LocalAccountSigner,
  sepolia,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";

const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);

const client = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
  signer: eoaSigner,
  gasManagerConfig: {
    policyId: "POLICY_ID", // replace with your policy id, get yours at https://dashboard.alchemy.com/
  },
});

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
  args: [client.getAddress()],
});

const uo = await client.sendUserOperation({
  uo: {
    target: "0xTargetAddress",
    data: uoCallData,
  },
});

const txHash = await client.waitForUserOperationTransaction(uo);

console.log(txHash);
