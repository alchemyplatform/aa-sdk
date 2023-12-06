export const NaniAccountFactoryAbi = [
  {
    inputs: [{ internalType: "address", name: "erc4337", type: "address" }],
    stateMutability: "payable",
    type: "constructor",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
    ],
    name: "createAccount",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "selector", type: "bytes4" }],
    name: "get",
    outputs: [{ internalType: "address", name: "executor", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "salt", type: "bytes32" }],
    name: "getAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initCodeHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes4", name: "selector", type: "bytes4" },
      { internalType: "address", name: "executor", type: "address" },
    ],
    name: "set",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
