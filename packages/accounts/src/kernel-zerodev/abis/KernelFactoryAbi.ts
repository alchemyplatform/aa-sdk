export const KernelFactoryAbi = [
  {
    inputs: [
      {
        internalType: "contract IEntryPoint",
        name: "_entryPoint",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "validator",
        type: "address",
      },
      { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "AccountCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract IKernelValidator",
        name: "_validator",
        type: "address",
      },
      { internalType: "bytes", name: "_data", type: "bytes" },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "createAccount",
    outputs: [
      { internalType: "contract EIP1967Proxy", name: "proxy", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "entryPoint",
    outputs: [
      { internalType: "contract IEntryPoint", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IKernelValidator",
        name: "_validator",
        type: "address",
      },
      { internalType: "bytes", name: "_data", type: "bytes" },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getAccountAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kernelTemplate",
    outputs: [
      { internalType: "contract TempKernel", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTemplate",
    outputs: [{ internalType: "contract Kernel", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
