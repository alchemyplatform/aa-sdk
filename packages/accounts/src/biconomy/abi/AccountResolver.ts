export const AccountResolverAbi = [
  {
    inputs: [
      { internalType: "address", name: "_v1Factory", type: "address" },
      { internalType: "address", name: "_v2Factory", type: "address" },
      { internalType: "address", name: "_ecdsaModule", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ecdsaOwnershipModule",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_eoa", type: "address" },
      { internalType: "uint8", name: "_maxIndex", type: "uint8" },
    ],
    name: "resolveAddresses",
    outputs: [
      {
        components: [
          { internalType: "address", name: "accountAddress", type: "address" },
          { internalType: "address", name: "factoryAddress", type: "address" },
          {
            internalType: "address",
            name: "currentImplementation",
            type: "address",
          },
          { internalType: "string", name: "currentVersion", type: "string" },
          { internalType: "string", name: "factoryVersion", type: "string" },
          { internalType: "uint256", name: "deploymentIndex", type: "uint256" },
        ],
        internalType: "struct IAddressResolver.SmartAccountResult[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_eoa", type: "address" },
      { internalType: "uint8", name: "_maxIndex", type: "uint8" },
      { internalType: "address", name: "_moduleAddress", type: "address" },
      { internalType: "bytes", name: "_moduleSetupData", type: "bytes" },
    ],
    name: "resolveAddressesFlexibleForV2",
    outputs: [
      {
        components: [
          { internalType: "address", name: "accountAddress", type: "address" },
          { internalType: "address", name: "factoryAddress", type: "address" },
          {
            internalType: "address",
            name: "currentImplementation",
            type: "address",
          },
          { internalType: "string", name: "currentVersion", type: "string" },
          { internalType: "string", name: "factoryVersion", type: "string" },
          { internalType: "uint256", name: "deploymentIndex", type: "uint256" },
        ],
        internalType: "struct IAddressResolver.SmartAccountResult[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_eoa", type: "address" },
      { internalType: "uint8", name: "_maxIndex", type: "uint8" },
    ],
    name: "resolveAddressesV1",
    outputs: [
      {
        components: [
          { internalType: "address", name: "accountAddress", type: "address" },
          { internalType: "address", name: "factoryAddress", type: "address" },
          {
            internalType: "address",
            name: "currentImplementation",
            type: "address",
          },
          { internalType: "string", name: "currentVersion", type: "string" },
          { internalType: "string", name: "factoryVersion", type: "string" },
          { internalType: "uint256", name: "deploymentIndex", type: "uint256" },
        ],
        internalType: "struct IAddressResolver.SmartAccountResult[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "smartAccountFactoryV1",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "smartAccountFactoryV2",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
