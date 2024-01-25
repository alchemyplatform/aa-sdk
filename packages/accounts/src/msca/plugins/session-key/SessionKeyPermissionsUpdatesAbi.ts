export const SessionKeyPermissionsUpdatesAbi = [
  {
    type: "function",
    name: "setAccessListType",
    inputs: [
      {
        name: "contractAccessControlType",
        type: "uint8",
        internalType: "enum ISessionKeyPlugin.ContractAccessControlType",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setERC20SpendLimit",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "spendLimit", type: "uint256", internalType: "uint256" },
      {
        name: "refreshInterval",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setGasSpendLimit",
    inputs: [
      { name: "spendLimit", type: "uint256", internalType: "uint256" },
      {
        name: "refreshInterval",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setNativeTokenSpendLimit",
    inputs: [
      { name: "spendLimit", type: "uint256", internalType: "uint256" },
      {
        name: "refreshInterval",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRequiredPaymaster",
    inputs: [
      {
        name: "requiredPaymaster",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAccessListAddressEntry",
    inputs: [
      {
        name: "contractAddress",
        type: "address",
        internalType: "address",
      },
      { name: "isOnList", type: "bool", internalType: "bool" },
      { name: "checkSelectors", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAccessListFunctionEntry",
    inputs: [
      {
        name: "contractAddress",
        type: "address",
        internalType: "address",
      },
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      { name: "isOnList", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateTimeRange",
    inputs: [
      { name: "validAfter", type: "uint48", internalType: "uint48" },
      { name: "validUntil", type: "uint48", internalType: "uint48" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
