export const SessionKeyPermissionsUpdatesAbi = [
  {
    inputs: [
      {
        internalType:
          "enum ISessionKeyPermissionsPlugin.ContractAccessControlType",
        name: "contractAccessControlType",
        type: "uint8",
      },
    ],
    name: "setAccessListType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "spendLimit",
        type: "uint256",
      },
      {
        internalType: "uint48",
        name: "refreshInterval",
        type: "uint48",
      },
    ],
    name: "setERC20SpendLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "spendLimit",
        type: "uint256",
      },
      {
        internalType: "uint48",
        name: "refreshInterval",
        type: "uint48",
      },
    ],
    name: "setGasSpendLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "spendLimit",
        type: "uint256",
      },
      {
        internalType: "uint48",
        name: "refreshInterval",
        type: "uint48",
      },
    ],
    name: "setNativeTokenSpendLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "requiredPaymaster",
        type: "address",
      },
    ],
    name: "setRequiredPaymaster",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isOnList",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "checkSelectors",
        type: "bool",
      },
    ],
    name: "updateAccessListAddressEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "bool",
        name: "isOnList",
        type: "bool",
      },
    ],
    name: "updateAccessListFunctionEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint48",
        name: "validAfter",
        type: "uint48",
      },
      {
        internalType: "uint48",
        name: "validUntil",
        type: "uint48",
      },
    ],
    name: "updateTimeRange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
