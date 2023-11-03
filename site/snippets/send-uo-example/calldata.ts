import { encodeFunctionData } from "viem";
import { connectedProvider } from "./connect-account.js";

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
