export const BiconomyFactoryAbi = [
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
        name: "initialAuthModule",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "AccountCreation",
    type: "event",
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
        name: "initialAuthModule",
        type: "address",
      },
    ],
    name: "AccountCreationWithoutIndex",
    type: "event",
  },
  {
    inputs: [],
    name: "accountCreationCode",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "moduleSetupContract",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "moduleSetupData",
        type: "bytes",
      },
    ],
    name: "deployAccount",
    outputs: [
      {
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "moduleSetupContract",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "moduleSetupData",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "deployCounterFactualAccount",
    outputs: [
      {
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "moduleSetupContract",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "moduleSetupData",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getAddressForCounterFactualAccount",
    outputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
